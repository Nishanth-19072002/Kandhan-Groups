import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invoicePayments, salesInvoices } from "@/lib/db/schema";
import { getAuthenticatedUser } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const payments = await db
      .select()
      .from(invoicePayments)
      .where(eq(invoicePayments.invoiceId, id))
      .orderBy(desc(invoicePayments.paymentDate));

    return NextResponse.json({ payments });
  } catch (error) {
    console.error("Fetch invoice payments error:", error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const [inv] = await db.select().from(salesInvoices).where(eq(salesInvoices.id, id));
    if (!inv) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const { amount, paymentMode, referenceNumber, paymentDate, notes } = await req.json();

    const paymentAmount = Number(amount);
    if (!paymentAmount || paymentAmount <= 0) {
      return NextResponse.json({ error: "Valid payment amount is required" }, { status: 400 });
    }

    const newAmountPaid = inv.amountPaid + paymentAmount;
    const newBalance = Math.max(0, inv.totalInvoiceAmount - newAmountPaid);
    const newStatus = newBalance <= 0 ? "PAID" : "PARTIAL";

    // 1. Insert payment receipt
    const paymentId = "pay_" + crypto.randomUUID().slice(0, 8);
    await db.insert(invoicePayments).values({
      id: paymentId,
      invoiceId: id,
      amount: paymentAmount,
      paymentMode: paymentMode || "NEFT_RTGS",
      referenceNumber: referenceNumber || null,
      paymentDate: paymentDate || new Date().toISOString().split("T")[0],
      notes: notes || null,
    });

    // 2. Update invoice status
    await db
      .update(salesInvoices)
      .set({
        amountPaid: newAmountPaid,
        balanceAmount: newBalance,
        paymentStatus: newStatus,
      })
      .where(eq(salesInvoices.id, id));

    return NextResponse.json({
      success: true,
      paymentId,
      amountPaid: newAmountPaid,
      balanceAmount: newBalance,
      paymentStatus: newStatus,
    });
  } catch (error) {
    console.error("Record payment error:", error);
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
  }
}

