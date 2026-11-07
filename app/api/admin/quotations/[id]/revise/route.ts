import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  quotations,
  quotationRevisions,
  quotationItems,
  masterItems,
} from "@/lib/db/schema";
import { getAuthenticatedUser } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";

// POST: Create a formal new Revision (R1 -> R2 -> R3...) with negotiation history
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
    const body = await req.json();
    const {
      negotiationNotes,
      scopeOfWork,
      termsAndConditions,
      bankAccountId,
      gstRate = 18.0,
      discountAmount = 0,
      items = [],
    } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "At least one line item is required for revision" },
        { status: 400 }
      );
    }

    // 1. Verify quotation exists
    const [quote] = await db
      .select()
      .from(quotations)
      .where(eq(quotations.id, id));

    if (!quote) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    // 2. Determine new revision number
    const [latestRev] = await db
      .select({ revisionNumber: quotationRevisions.revisionNumber })
      .from(quotationRevisions)
      .where(eq(quotationRevisions.quotationId, id))
      .orderBy(desc(quotationRevisions.revisionNumber))
      .limit(1);

    const nextRevisionNumber = (latestRev?.revisionNumber || quote.currentRevision || 1) + 1;

    // 3. Compute cost, margin, subtotal & taxes
    let subtotal = 0;
    let totalCost = 0;
    const computedItems = items.map((it: any, idx: number) => {
      const qty = Number(it.quantity) || 0;
      const rate = Number(it.unitRate) || 0;
      const cost = Number(it.costRate) || 0;
      const margin = it.marginPercent !== undefined ? Number(it.marginPercent) : (cost > 0 ? Math.round(((rate - cost) / cost) * 100) : 0);
      const amount = Math.round(qty * rate * 100) / 100;
      subtotal += amount;
      totalCost += Math.round(qty * cost * 100) / 100;
      return {
        ...it,
        costRate: cost,
        marginPercent: margin,
        quantity: qty,
        unitRate: rate,
        amount,
        itemOrder: idx,
      };
    });

    const totalMargin = Math.round((subtotal - totalCost) * 100) / 100;
    const overallMarginPercent = totalCost > 0 ? Math.round((totalMargin / totalCost) * 100 * 10) / 10 : 0;

    const netTaxable = Math.max(0, subtotal - (Number(discountAmount) || 0));
    const gstTotal = Math.round((netTaxable * (Number(gstRate) / 100)) * 100) / 100;
    const cgstAmount = Math.round((gstTotal / 2) * 100) / 100;
    const sgstAmount = cgstAmount;
    const grandTotal = Math.round(netTaxable + gstTotal);

    // 4. Insert new Revision row (freezing previous revision history!)
    const revisionId = "rev_" + crypto.randomUUID().slice(0, 8);
    await db.insert(quotationRevisions).values({
      id: revisionId,
      quotationId: id,
      revisionNumber: nextRevisionNumber,
      subtotal,
      totalCost,
      totalMargin,
      overallMarginPercent,
      negotiationNotes: negotiationNotes || `Revision ${nextRevisionNumber} issued after commercial discussion.`,
      gstRate: Number(gstRate),
      cgstAmount,
      sgstAmount,
      igstAmount: 0,
      discountAmount: Number(discountAmount) || 0,
      grandTotal,
      scopeOfWork: scopeOfWork || null,
      termsAndConditions: termsAndConditions || null,
      bankAccountId: bankAccountId || null,
    });

    // 5. Insert new items under this new revision
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
        costRate: it.costRate,
        marginPercent: it.marginPercent,
        unitRate: it.unitRate,
        amount: it.amount,
      });

      if (it.saveToMaster && it.description) {
        try {
          await db.insert(masterItems).values({
            id: "mi_" + crypto.randomUUID().slice(0, 8),
            category: it.category || "General Civil",
            itemName: it.description.slice(0, 60),
            description: it.description,
            unit: it.unit || "sq.ft",
            standardRate: it.unitRate || 0,
            hsnSacCode: it.hsnSacCode || "9954",
            isCustom: true,
          });
        } catch (mErr) {
          console.log("Master item duplicate ignored:", mErr);
        }
      }
    }

    // 6. Update Quotation currentRevision to the new revision and status to REVISED
    await db
      .update(quotations)
      .set({
        currentRevision: nextRevisionNumber,
        status: "REVISED",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(quotations.id, id));

    return NextResponse.json({
      success: true,
      quotationId: id,
      newRevisionNumber: nextRevisionNumber,
      grandTotal,
    });
  } catch (error) {
    console.error("Revise quotation error:", error);
    return NextResponse.json({ error: "Failed to create revision" }, { status: 500 });
  }
}

