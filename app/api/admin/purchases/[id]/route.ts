import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { purchaseBills, billAttachments } from "@/lib/db/schema";
import { getAuthenticatedUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

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
    const [bill] = await db
      .select()
      .from(purchaseBills)
      .where(eq(purchaseBills.id, id));

    if (!bill) {
      return NextResponse.json({ error: "Purchase bill not found" }, { status: 404 });
    }

    const attachments = await db
      .select()
      .from(billAttachments)
      .where(eq(billAttachments.purchaseBillId, id));

    return NextResponse.json({ bill, attachments });
  } catch (error) {
    console.error("Fetch purchase bill error:", error);
    return NextResponse.json({ error: "Failed to fetch purchase bill" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const {
      vendorId,
      orderConfirmationId,
      vendorInvoiceNumber,
      billDate,
      category,
      taxableAmount,
      taxableValue,
      gstRate = 18,
      itcEligibility,
    } = body;

    const [existing] = await db
      .select()
      .from(purchaseBills)
      .where(eq(purchaseBills.id, id));

    if (!existing) {
      return NextResponse.json({ error: "Purchase bill not found" }, { status: 404 });
    }

    const rawTaxable = taxableValue !== undefined ? taxableValue : taxableAmount;
    const numTaxable = rawTaxable !== undefined ? Number(rawTaxable) : existing.taxableValue;
    const numGstRate = Number(gstRate) || 18;
    const gstTotal = Math.round((numTaxable * (numGstRate / 100)) * 100) / 100;
    const cgstAmount = Math.round((gstTotal / 2) * 100) / 100;
    const sgstAmount = cgstAmount;
    const totalBillAmount = Math.round(numTaxable + gstTotal);

    await db
      .update(purchaseBills)
      .set({
        vendorId: vendorId || existing.vendorId,
        orderConfirmationId: orderConfirmationId !== undefined ? orderConfirmationId : existing.orderConfirmationId,
        vendorInvoiceNumber: vendorInvoiceNumber || existing.vendorInvoiceNumber,
        billDate: billDate || existing.billDate,
        category: category || existing.category,
        taxableValue: numTaxable,
        cgstAmount,
        sgstAmount,
        totalBillAmount,
        itcEligibility: itcEligibility || existing.itcEligibility,
      })
      .where(eq(purchaseBills.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Edit purchase bill error:", error);
    return NextResponse.json({ error: "Failed to edit purchase bill" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Delete attachments
    await db.delete(billAttachments).where(eq(billAttachments.purchaseBillId, id));

    // Delete bill
    await db.delete(purchaseBills).where(eq(purchaseBills.id, id));

    return NextResponse.json({ success: true, message: "Purchase bill deleted successfully" });
  } catch (error) {
    console.error("Delete purchase bill error:", error);
    return NextResponse.json({ error: "Failed to delete purchase bill" }, { status: 500 });
  }
}
