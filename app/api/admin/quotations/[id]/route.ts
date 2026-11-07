import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  quotations,
  quotationRevisions,
  quotationItems,
  orderConfirmations,
  clients,
  enquiries,
  companySettings,
  companyBankAccounts,
  masterItems,
} from "@/lib/db/schema";
import { getAuthenticatedUser } from "@/lib/auth";
import { eq, desc, inArray, sql } from "drizzle-orm";
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
  const url = new URL(req.url);
  const revParam = url.searchParams.get("revision");

  try {
    const [quote] = await db
      .select({
        id: quotations.id,
        quoteNumber: quotations.quoteNumber,
        currentRevision: quotations.currentRevision,
        status: quotations.status,
        createdAt: quotations.createdAt,
        clientId: clients.id,
        clientName: clients.name,
        clientPhone: clients.phone,
        clientEmail: clients.email,
        companyName: clients.companyName,
        gstin: clients.gstin,
        billingAddress: clients.billingAddress,
        siteAddress: clients.siteAddress,
        enquiryId: enquiries.id,
        workType: enquiries.workType,
        siteLocation: enquiries.siteLocation,
      })
      .from(quotations)
      .innerJoin(clients, eq(quotations.clientId, clients.id))
      .leftJoin(enquiries, eq(quotations.enquiryId, enquiries.id))
      .where(eq(quotations.id, id));

    if (!quote) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    // Fetch all revisions
    const allRevisions = await db
      .select()
      .from(quotationRevisions)
      .where(eq(quotationRevisions.quotationId, id))
      .orderBy(desc(quotationRevisions.revisionNumber));

    // Choose target revision
    const targetRevNum = revParam ? parseInt(revParam) : quote.currentRevision;
    const activeRevision = allRevisions.find((r) => r.revisionNumber === targetRevNum) || allRevisions[0];

    // Fetch items for this revision
    const items = activeRevision
      ? await db
          .select()
          .from(quotationItems)
          .where(eq(quotationItems.revisionId, activeRevision.id))
          .orderBy(quotationItems.itemOrder)
      : [];

    // Company Settings for printable letterhead
    const [company] = await db.select().from(companySettings).where(eq(companySettings.id, "primary"));

    // Selectable bank account for payment remittance
    let bankAccount = null;
    if (activeRevision?.bankAccountId) {
      const [b] = await db
        .select()
        .from(companyBankAccounts)
        .where(eq(companyBankAccounts.id, activeRevision.bankAccountId));
      bankAccount = b;
    }
    if (!bankAccount) {
      const [defaultBank] = await db
        .select()
        .from(companyBankAccounts)
        .where(eq(companyBankAccounts.isDefault, true));
      bankAccount = defaultBank;
    }

    return NextResponse.json({
      quotation: quote,
      allRevisions,
      activeRevision,
      items,
      company,
      bankAccount,
    });
  } catch (error) {
    console.error("Fetch quote details error:", error);
    return NextResponse.json({ error: "Failed to fetch quotation details" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { status } = await req.json();
    if (status) {
      await db
        .update(quotations)
        .set({ status, updatedAt: new Date().toISOString() })
        .where(eq(quotations.id, id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update quotation error:", error);
    return NextResponse.json({ error: "Failed to update quotation" }, { status: 500 });
  }
}

// Full Edit Quotation
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
      clientId,
      enquiryId,
      status,
      bankAccountId,
      scopeOfWork,
      termsAndConditions,
      gstRate = 18.0,
      discountAmount = 0,
      items = [],
    } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "At least one line item is required" },
        { status: 400 }
      );
    }

    // 1. Verify quote exists
    const [existingQuote] = await db
      .select()
      .from(quotations)
      .where(eq(quotations.id, id));

    if (!existingQuote) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    // 2. Calculate subtotal, cost, margin & tax
    let subtotal = 0;
    let totalCost = 0;
    const computedItems = items.map((it: {
      category: string;
      description: string;
      unit: string;
      quantity: number;
      unitRate: number;
      costRate?: number;
      marginPercent?: number;
      hsnSacCode?: string;
    }, idx: number) => {
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

    // 3. Update Quotation Master
    await db
      .update(quotations)
      .set({
        clientId: clientId || existingQuote.clientId,
        enquiryId: enquiryId !== undefined ? enquiryId : existingQuote.enquiryId,
        status: status || existingQuote.status,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(quotations.id, id));

    // 4. Find active revision
    const [rev] = await db
      .select()
      .from(quotationRevisions)
      .where(
        eq(quotationRevisions.quotationId, id)
      )
      .orderBy(desc(quotationRevisions.revisionNumber));

    const revisionId = rev ? rev.id : "rev_" + crypto.randomUUID().slice(0, 8);

    if (rev) {
      await db
        .update(quotationRevisions)
        .set({
          bankAccountId: bankAccountId || rev.bankAccountId,
          subtotal,
          totalCost,
          totalMargin,
          overallMarginPercent,
          gstRate: Number(gstRate),
          cgstAmount,
          sgstAmount,
          discountAmount: Number(discountAmount) || 0,
          grandTotal,
          scopeOfWork: scopeOfWork || null,
          termsAndConditions: termsAndConditions || rev.termsAndConditions,
        })
        .where(eq(quotationRevisions.id, rev.id));

      // Remove old items for this revision
      await db
        .delete(quotationItems)
        .where(eq(quotationItems.revisionId, rev.id));
    } else {
      // Create revision if none existed
      await db.insert(quotationRevisions).values({
        id: revisionId,
        quotationId: id,
        revisionNumber: 1,
        bankAccountId: bankAccountId || null,
        subtotal,
        totalCost,
        totalMargin,
        overallMarginPercent,
        gstRate: Number(gstRate),
        cgstAmount,
        sgstAmount,
        igstAmount: 0,
        discountAmount: Number(discountAmount) || 0,
        grandTotal,
        scopeOfWork: scopeOfWork || null,
        termsAndConditions: termsAndConditions || null,
      });
    }

    // 5. Insert new items and auto-save flagged items into master catalog
    for (const it of computedItems as any[]) {
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
          console.log("Master item duplicate or error ignored:", mErr);
        }
      }
    }

    // 6. If status is set to CONFIRMED, ensure an OrderConfirmation / Work Order exists
    if (status === "CONFIRMED") {
      const [existingOrder] = await db
        .select()
        .from(orderConfirmations)
        .where(eq(orderConfirmations.quotationId, id));

      if (!existingOrder) {
        const year = new Date().getFullYear();
        const [woCount] = await db.select({ count: sql<number>`count(*)` }).from(orderConfirmations);
        const nextSeq = String((woCount?.count || 0) + 1).padStart(3, "0");
        const orderNumber = `KG-WO-${year}-${nextSeq}`;
        const orderId = "wo_" + crypto.randomUUID().slice(0, 8);

        await db.insert(orderConfirmations).values({
          id: orderId,
          orderNumber,
          enquiryId: existingQuote.enquiryId || null,
          quotationId: id,
          confirmedRevisionId: revisionId,
          clientId: clientId || existingQuote.clientId,
          agreedContractValue: grandTotal,
          advanceAgreed: Math.round(grandTotal * 0.25),
          startDate: new Date().toISOString().split("T")[0],
          status: "ACTIVE",
          contractTerms: termsAndConditions || rev?.termsAndConditions || null,
          bankAccountId: bankAccountId || rev?.bankAccountId || null,
        });
      }
    }

    return NextResponse.json({
      success: true,
      quotationId: id,
      grandTotal,
    });
  } catch (error) {
    console.error("Edit quotation error:", error);
    return NextResponse.json({ error: "Failed to edit quotation" }, { status: 500 });
  }
}

// Delete Quotation
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
    // 1. Check if linked to an active confirmed Order / Work Order
    const [confirmedOrder] = await db
      .select()
      .from(orderConfirmations)
      .where(eq(orderConfirmations.quotationId, id));

    if (confirmedOrder) {
      return NextResponse.json(
        {
          error: `Cannot delete quotation: Work Order ${confirmedOrder.orderNumber} is active against this quote. Please delete or archive the Work Order first.`,
        },
        { status: 400 }
      );
    }

    // 2. Fetch all revision IDs for this quote
    const revisions = await db
      .select({ id: quotationRevisions.id })
      .from(quotationRevisions)
      .where(eq(quotationRevisions.quotationId, id));

    const revisionIds = revisions.map((r) => r.id);

    // 3. Delete items for all revisions
    if (revisionIds.length > 0) {
      await db
        .delete(quotationItems)
        .where(inArray(quotationItems.revisionId, revisionIds));
    }

    // 4. Delete revisions
    await db
      .delete(quotationRevisions)
      .where(eq(quotationRevisions.quotationId, id));

    // 5. Delete quotation record
    await db
      .delete(quotations)
      .where(eq(quotations.id, id));

    return NextResponse.json({
      success: true,
      message: "Quotation deleted successfully",
    });
  } catch (error) {
    console.error("Delete quotation error:", error);
    return NextResponse.json({ error: "Failed to delete quotation" }, { status: 500 });
  }
}
