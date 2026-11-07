import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { salesInvoices, clients, orderConfirmations, quotations } from "@/lib/db/schema";
import { getAuthenticatedUser } from "@/lib/auth";
import { eq, desc, sql } from "drizzle-orm";
import crypto from "crypto";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const list = await db
      .select({
        id: salesInvoices.id,
        invoiceNumber: salesInvoices.invoiceNumber,
        invoiceType: salesInvoices.invoiceType,
        invoiceDate: salesInvoices.invoiceDate,
        dueDate: salesInvoices.dueDate,
        taxableValue: salesInvoices.taxableValue,
        gstRate: salesInvoices.gstRate,
        cgstAmount: salesInvoices.cgstAmount,
        sgstAmount: salesInvoices.sgstAmount,
        igstAmount: salesInvoices.igstAmount,
        totalInvoiceAmount: salesInvoices.totalInvoiceAmount,
        amountPaid: salesInvoices.amountPaid,
        balanceAmount: salesInvoices.balanceAmount,
        paymentStatus: salesInvoices.paymentStatus,
        notes: salesInvoices.notes,
        createdAt: salesInvoices.createdAt,
        clientId: clients.id,
        clientName: clients.name,
        clientPhone: clients.phone,
        companyName: clients.companyName,
        gstin: clients.gstin,
        orderNumber: orderConfirmations.orderNumber,
      })
      .from(salesInvoices)
      .innerJoin(clients, eq(salesInvoices.clientId, clients.id))
      .leftJoin(orderConfirmations, eq(salesInvoices.orderConfirmationId, orderConfirmations.id))
      .orderBy(desc(salesInvoices.createdAt));

    return NextResponse.json({ invoices: list });
  } catch (error) {
    console.error("Fetch invoices error:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Site Engineers cannot issue formal Tax Invoices
  if (user.role === "SITE_ENGINEER") {
    return NextResponse.json({ error: "Only Accountant or Super Admin can issue Tax Invoices" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      clientId,
      orderConfirmationId,
      orderId,
      quotationId,
      invoiceType = "TAX_INVOICE",
      invoiceDate,
      dueDate,
      taxableValue,
      gstRate = 18.0,
      isInterState = false,
      notes,
    } = body;

    const incomingOrderId = orderConfirmationId || orderId || null;

    if (!clientId || !taxableValue || !invoiceDate) {
      return NextResponse.json(
        { error: "Client, taxable value, and invoice date are required" },
        { status: 400 }
      );
    }

    // 1. Generate Invoice Number: KG-PI-YYYY-XXX or KG-INV-YYYY-XXX
    const year = new Date().getFullYear();
    const [invCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(salesInvoices);
    const nextSeq = String((invCount?.count || 0) + 1).padStart(3, "0");
    const prefix = invoiceType === "PROFORMA" ? "KG-PI" : "KG-INV";
    const invoiceNumber = `${prefix}-${year}-${nextSeq}`;

    const numTaxable = Number(taxableValue);
    const gstTotal = Math.round((numTaxable * (Number(gstRate) / 100)) * 100) / 100;

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (isInterState) {
      igstAmount = gstTotal;
    } else {
      cgstAmount = Math.round((gstTotal / 2) * 100) / 100;
      sgstAmount = cgstAmount;
    }

    const totalInvoiceAmount = Math.round(numTaxable + gstTotal);

    const invoiceId = "inv_" + crypto.randomUUID().slice(0, 8);
    await db.insert(salesInvoices).values({
      id: invoiceId,
      orderConfirmationId: incomingOrderId,
      quotationId: quotationId || null,
      clientId,
      invoiceNumber,
      invoiceType,
      invoiceDate,
      dueDate: dueDate || null,
      taxableValue: numTaxable,
      gstRate: Number(gstRate),
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalInvoiceAmount,
      amountPaid: 0,
      balanceAmount: totalInvoiceAmount,
      paymentStatus: "UNPAID",
      notes: notes || null,
    });

    return NextResponse.json({
      success: true,
      invoiceId,
      invoiceNumber,
      totalInvoiceAmount,
    });
  } catch (error) {
    console.error("Create invoice error:", error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}

