import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quotations, quotationRevisions, quotationItems } from "@/lib/db/schema";
import { getAuthenticatedUser } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";
import crypto from "crypto";

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
    const [quote] = await db.select().from(quotations).where(eq(quotations.id, id));
    if (!quote) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    if (quote.status === "CONFIRMED") {
      return NextResponse.json(
        { error: "Cannot revise an already confirmed quotation." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      scopeOfWork,
      termsAndConditions,
      gstRate = 18.0,
      discountAmount = 0,
      items = [],
    } = body;

    const newRevNumber = quote.currentRevision + 1;

    // Recalculate totals
    let subtotal = 0;
    const computedItems = items.map((it: {
      category: string;
      description: string;
      unit: string;
      quantity: number;
      unitRate: number;
      hsnSacCode?: string;
    }, idx: number) => {
      const qty = Number(it.quantity) || 0;
      const rate = Number(it.unitRate) || 0;
      const amount = Math.round(qty * rate * 100) / 100;
      subtotal += amount;
      return {
        ...it,
        quantity: qty,
        unitRate: rate,
        amount,
        itemOrder: idx,
      };
    });

    const netTaxable = Math.max(0, subtotal - (Number(discountAmount) || 0));
    const gstTotal = Math.round((netTaxable * (Number(gstRate) / 100)) * 100) / 100;
    const cgstAmount = Math.round((gstTotal / 2) * 100) / 100;
    const sgstAmount = cgstAmount;
    const grandTotal = Math.round(netTaxable + gstTotal);

    // Insert new Revision
    const revisionId = "rev_" + crypto.randomUUID().slice(0, 8);
    await db.insert(quotationRevisions).values({
      id: revisionId,
      quotationId: quote.id,
      revisionNumber: newRevNumber,
      subtotal,
      gstRate: Number(gstRate),
      cgstAmount,
      sgstAmount,
      igstAmount: 0,
      discountAmount: Number(discountAmount) || 0,
      grandTotal,
      scopeOfWork: scopeOfWork || null,
      termsAndConditions: termsAndConditions || null,
    });

    // Insert items for new revision
    for (const it of computedItems) {
      await db.insert(quotationItems).values({
        id: "qi_" + crypto.randomUUID().slice(0, 8),
        revisionId,
        itemOrder: it.itemOrder,
        category: it.category || "Civil Works",
        description: it.description,
        hsnSacCode: it.hsnSacCode || "9954",
        unit: it.unit || "sq.ft",
        quantity: it.quantity,
        unitRate: it.unitRate,
        amount: it.amount,
      });
    }

    // Update quote parent revision pointer
    await db
      .update(quotations)
      .set({
        currentRevision: newRevNumber,
        status: "REVISED",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(quotations.id, quote.id));

    return NextResponse.json({
      success: true,
      revisionNumber: newRevNumber,
      grandTotal,
    });
  } catch (error) {
    console.error("Create revision error:", error);
    return NextResponse.json({ error: "Failed to create revision" }, { status: 500 });
  }
}

