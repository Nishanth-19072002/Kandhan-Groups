import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  salesInvoices,
  purchaseBills,
  clients,
  vendors,
  gstMonthlyReconciliations,
} from "@/lib/db/schema";
import { getAuthenticatedUser } from "@/lib/auth";
import { eq, sql, and, gte, lte } from "drizzle-orm";
import crypto from "crypto";

export async function GET(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Site Engineers cannot access GST
  if (user.role === "SITE_ENGINEER") {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const url = new URL(req.url);
  const month = parseInt(url.searchParams.get("month") || String(new Date().getMonth() + 1));
  const year = parseInt(url.searchParams.get("year") || String(new Date().getFullYear()));

  try {
    // Format start and end date for month: YYYY-MM-01 to YYYY-MM-31
    const padMonth = String(month).padStart(2, "0");
    const startDate = `${year}-${padMonth}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${padMonth}-${String(lastDay).padStart(2, "0")}`;

    // 1. Fetch Sales Invoices for this month
    const sales = await db
      .select({
        id: salesInvoices.id,
        invoiceNumber: salesInvoices.invoiceNumber,
        invoiceDate: salesInvoices.invoiceDate,
        taxableValue: salesInvoices.taxableValue,
        gstRate: salesInvoices.gstRate,
        cgstAmount: salesInvoices.cgstAmount,
        sgstAmount: salesInvoices.sgstAmount,
        igstAmount: salesInvoices.igstAmount,
        totalInvoiceAmount: salesInvoices.totalInvoiceAmount,
        clientName: clients.name,
        companyName: clients.companyName,
        clientGstin: clients.gstin,
      })
      .from(salesInvoices)
      .innerJoin(clients, eq(salesInvoices.clientId, clients.id))
      .where(and(gte(salesInvoices.invoiceDate, startDate), lte(salesInvoices.invoiceDate, endDate)));

    // 2. Fetch Purchase Bills for this month
    const purchases = await db
      .select({
        id: purchaseBills.id,
        vendorInvoiceNumber: purchaseBills.vendorInvoiceNumber,
        billDate: purchaseBills.billDate,
        category: purchaseBills.category,
        taxableValue: purchaseBills.taxableValue,
        cgstAmount: purchaseBills.cgstAmount,
        sgstAmount: purchaseBills.sgstAmount,
        igstAmount: purchaseBills.igstAmount,
        totalBillAmount: purchaseBills.totalBillAmount,
        itcEligibility: purchaseBills.itcEligibility,
        verifiedByAccountant: purchaseBills.verifiedByAccountant,
        vendorName: vendors.name,
        vendorGstin: vendors.gstin,
      })
      .from(purchaseBills)
      .innerJoin(vendors, eq(purchaseBills.vendorId, vendors.id))
      .where(and(gte(purchaseBills.billDate, startDate), lte(purchaseBills.billDate, endDate)));

    // Compute Sales Totals (Outward Supplies - GSTR-1)
    let totalOutwardTaxable = 0;
    let outputCgst = 0;
    let outputSgst = 0;
    let outputIgst = 0;
    let b2bSalesCount = 0;
    let b2cSalesCount = 0;

    for (const s of sales) {
      totalOutwardTaxable += s.taxableValue;
      outputCgst += s.cgstAmount;
      outputSgst += s.sgstAmount;
      outputIgst += s.igstAmount;
      if (s.clientGstin) b2bSalesCount++;
      else b2cSalesCount++;
    }

    // Compute Purchase Totals (Eligible ITC - GSTR-3B Table 4)
    let totalInwardTaxable = 0;
    let inputEligibleCgst = 0;
    let inputEligibleSgst = 0;
    let inputEligibleIgst = 0;
    let ineligibleCount = 0;

    for (const p of purchases) {
      totalInwardTaxable += p.taxableValue;
      if (p.itcEligibility === "ELIGIBLE") {
        inputEligibleCgst += p.cgstAmount;
        inputEligibleSgst += p.sgstAmount;
        inputEligibleIgst += p.igstAmount;
      } else {
        ineligibleCount++;
      }
    }

    // 3. Fetch existing saved reconciliation record & adjustments if any
    const [savedRecon] = await db
      .select()
      .from(gstMonthlyReconciliations)
      .where(
        and(
          eq(gstMonthlyReconciliations.filingMonth, month),
          eq(gstMonthlyReconciliations.filingYear, year)
        )
      );

    const adjCgst = savedRecon?.manualAdjustmentCgst || 0;
    const adjSgst = savedRecon?.manualAdjustmentSgst || 0;
    const adjIgst = savedRecon?.manualAdjustmentIgst || 0;
    const adjReason = savedRecon?.adjustmentReason || "";
    const filingStatus = savedRecon?.status || "DRAFT";

    // Net Liability Calculation
    const totalOutput = outputCgst + outputSgst + outputIgst;
    const totalInput = inputEligibleCgst + inputEligibleSgst + inputEligibleIgst;
    const totalAdj = adjCgst + adjSgst + adjIgst;

    const netPayableCgst = Math.max(0, outputCgst - inputEligibleCgst + adjCgst);
    const netPayableSgst = Math.max(0, outputSgst - inputEligibleSgst + adjSgst);
    const netPayableIgst = Math.max(0, outputIgst - inputEligibleIgst + adjIgst);
    const totalNetPayable = netPayableCgst + netPayableSgst + netPayableIgst;

    const itcCarriedForward = Math.max(0, totalInput - totalOutput - totalAdj);
    const isNilReturn = sales.length === 0 && purchases.length === 0;

    return NextResponse.json({
      month,
      year,
      isNilReturn,
      filingStatus,
      summary: {
        totalOutwardTaxable,
        outputCgst,
        outputSgst,
        outputIgst,
        totalOutput,
        totalInwardTaxable,
        inputEligibleCgst,
        inputEligibleSgst,
        inputEligibleIgst,
        totalInput,
        adjCgst,
        adjSgst,
        adjIgst,
        adjReason,
        netPayableCgst,
        netPayableSgst,
        netPayableIgst,
        totalNetPayable,
        itcCarriedForward,
        b2bSalesCount,
        b2cSalesCount,
        ineligibleCount,
      },
      sales,
      purchases,
    });
  } catch (error) {
    console.error("Fetch GST reconciliation error:", error);
    return NextResponse.json({ error: "Failed to fetch GST data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user || user.role === "SITE_ENGINEER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      month,
      year,
      adjCgst = 0,
      adjSgst = 0,
      adjIgst = 0,
      adjustmentReason = "",
      status = "DRAFT",
    } = body;

    const [existing] = await db
      .select()
      .from(gstMonthlyReconciliations)
      .where(
        and(
          eq(gstMonthlyReconciliations.filingMonth, month),
          eq(gstMonthlyReconciliations.filingYear, year)
        )
      );

    if (existing) {
      await db
        .update(gstMonthlyReconciliations)
        .set({
          manualAdjustmentCgst: Number(adjCgst),
          manualAdjustmentSgst: Number(adjSgst),
          manualAdjustmentIgst: Number(adjIgst),
          adjustmentReason,
          status,
        })
        .where(eq(gstMonthlyReconciliations.id, existing.id));
    } else {
      await db.insert(gstMonthlyReconciliations).values({
        id: "gst_" + crypto.randomUUID().slice(0, 8),
        filingMonth: month,
        filingYear: year,
        returnType: "GSTR_3B",
        manualAdjustmentCgst: Number(adjCgst),
        manualAdjustmentSgst: Number(adjSgst),
        manualAdjustmentIgst: Number(adjIgst),
        adjustmentReason,
        status,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save GST adjustments error:", error);
    return NextResponse.json({ error: "Failed to save GST adjustments" }, { status: 500 });
  }
}

