import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { salesInvoices, invoicePayments } from "@/lib/db/schema";
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
    const [inv] = await db
      .select()
      .from(salesInvoices)
      .where(eq(salesInvoices.id, id));

    if (!inv) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const payments = await db
      .select()
      .from(invoicePayments)
      .where(eq(invoicePayments.invoiceId, id));

    return NextResponse.json({ invoice: inv, payments });
  } catch (error) {
    console.error("Fetch invoice error:", error);
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 });
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
      invoiceDate,
      dueDate,
      taxableValue,
      gstRate = 18,
      notes,
      paymentStatus,
    } = body;

    const [existing] = await db
      .select()
      .from(salesInvoices)
      .where(eq(salesInvoices.id, id));

    if (!existing) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const numTaxable = taxableValue !== undefined ? Number(taxableValue) : existing.taxableValue;
    const numGstRate = gstRate !== undefined ? Number(gstRate) : existing.gstRate;
    const gstTotal = Math.round((numTaxable * (numGstRate / 100)) * 100) / 100;
    const cgstAmount = Math.round((gstTotal / 2) * 100) / 100;
    const sgstAmount = cgstAmount;
    const totalInvoiceAmount = Math.round(numTaxable + gstTotal);
    const balanceAmount = Math.max(0, totalInvoiceAmount - existing.amountPaid);

    let finalStatus = paymentStatus || existing.paymentStatus;
    if (balanceAmount === 0 && totalInvoiceAmount > 0) {
      finalStatus = "PAID";
    } else if (existing.amountPaid > 0 && balanceAmount > 0) {
      finalStatus = "PARTIAL";
    }

    await db
      .update(salesInvoices)
      .set({
        invoiceDate: invoiceDate || existing.invoiceDate,
        dueDate: dueDate !== undefined ? dueDate : existing.dueDate,
        taxableValue: numTaxable,
        gstRate: numGstRate,
        cgstAmount,
        sgstAmount,
        totalInvoiceAmount,
        balanceAmount,
        paymentStatus: finalStatus,
        notes: notes !== undefined ? notes : existing.notes,
      })
      .where(eq(salesInvoices.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Edit invoice error:", error);
    return NextResponse.json({ error: "Failed to edit invoice" }, { status: 500 });
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
    // Delete payments first
    await db.delete(invoicePayments).where(eq(invoicePayments.invoiceId, id));

    // Delete invoice
    await db.delete(salesInvoices).where(eq(salesInvoices.id, id));

    return NextResponse.json({ success: true, message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Delete invoice error:", error);
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 });
  }
}
