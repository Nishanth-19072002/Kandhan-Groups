import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { purchaseBills, vendors, orderConfirmations, billAttachments } from "@/lib/db/schema";
import { getAuthenticatedUser } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const list = await db
      .select({
        id: purchaseBills.id,
        vendorId: purchaseBills.vendorId,
        orderConfirmationId: purchaseBills.orderConfirmationId,
        vendorInvoiceNumber: purchaseBills.vendorInvoiceNumber,
        billDate: purchaseBills.billDate,
        category: purchaseBills.category,
        taxableValue: purchaseBills.taxableValue,
        cgstAmount: purchaseBills.cgstAmount,
        sgstAmount: purchaseBills.sgstAmount,
        igstAmount: purchaseBills.igstAmount,
        totalBillAmount: purchaseBills.totalBillAmount,
        itcEligibility: purchaseBills.itcEligibility,
        paymentStatus: purchaseBills.paymentStatus,
        verifiedByAccountant: purchaseBills.verifiedByAccountant,
        createdAt: purchaseBills.createdAt,
        vendorName: vendors.name,
        vendorGstin: vendors.gstin,
        vendorPhone: vendors.phone,
        orderNumber: orderConfirmations.orderNumber,
      })
      .from(purchaseBills)
      .innerJoin(vendors, eq(purchaseBills.vendorId, vendors.id))
      .leftJoin(orderConfirmations, eq(purchaseBills.orderConfirmationId, orderConfirmations.id))
      .orderBy(desc(purchaseBills.createdAt));

    // Fetch attachments for each bill
    const billsWithAttachments = await Promise.all(
      list.map(async (b) => {
        const attachments = await db
          .select()
          .from(billAttachments)
          .where(eq(billAttachments.purchaseBillId, b.id));
        return {
          ...b,
          attachments,
        };
      })
    );

    return NextResponse.json({ purchases: billsWithAttachments });
  } catch (error) {
    console.error("Fetch purchases error:", error);
    return NextResponse.json({ error: "Failed to fetch purchases" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      vendorId,
      orderConfirmationId,
      vendorInvoiceNumber,
      billDate,
      category,
      taxableValue,
      gstRate = 18.0,
      isInterState = false,
      itcEligibility = "ELIGIBLE",
      fileUrl,
      fileName,
    } = body;

    if (!vendorId || !vendorInvoiceNumber || !billDate || !taxableValue || !category) {
      return NextResponse.json(
        { error: "Vendor, bill number, date, category, and taxable value are required" },
        { status: 400 }
      );
    }

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

    const totalBillAmount = Math.round(numTaxable + gstTotal);

    const billId = "pb_" + crypto.randomUUID().slice(0, 8);
    await db.insert(purchaseBills).values({
      id: billId,
      vendorId,
      orderConfirmationId: orderConfirmationId || null,
      vendorInvoiceNumber: vendorInvoiceNumber.trim(),
      billDate,
      category,
      taxableValue: numTaxable,
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalBillAmount,
      itcEligibility,
      paymentStatus: "UNPAID",
      verifiedByAccountant: user.role === "ACCOUNTANT" || user.role === "SUPER_ADMIN" ? 1 : 0,
      createdByUserId: user.id,
    });

    // If an image/file was attached, record it
    if (fileUrl) {
      await db.insert(billAttachments).values({
        id: "att_" + crypto.randomUUID().slice(0, 8),
        purchaseBillId: billId,
        fileName: fileName || "bill_receipt.jpg",
        fileUrl,
      });
    }

    return NextResponse.json({
      success: true,
      billId,
      totalBillAmount,
      itcClaimable: itcEligibility === "ELIGIBLE" ? gstTotal : 0,
    });
  } catch (error) {
    console.error("Create purchase bill error:", error);
    return NextResponse.json({ error: "Failed to create purchase bill" }, { status: 500 });
  }
}

