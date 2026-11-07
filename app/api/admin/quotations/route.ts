import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  quotations,
  quotationRevisions,
  quotationItems,
  clients,
  enquiries,
  companySettings,
  masterItems,
  orderConfirmations,
} from "@/lib/db/schema";
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
        enquiryId: enquiries.id,
        workType: enquiries.workType,
        siteLocation: enquiries.siteLocation,
        orderId: orderConfirmations.id,
        orderNumber: orderConfirmations.orderNumber,
        orderStatus: orderConfirmations.status,
      })
      .from(quotations)
      .innerJoin(clients, eq(quotations.clientId, clients.id))
      .leftJoin(enquiries, eq(quotations.enquiryId, enquiries.id))
      .leftJoin(orderConfirmations, eq(quotations.id, orderConfirmations.quotationId))
      .orderBy(desc(quotations.createdAt));

    // Fetch active revision and revision history summary for each quote
    const quotesWithDetails = await Promise.all(
      list.map(async (q) => {
        const allRevs = await db
          .select({
            id: quotationRevisions.id,
            revisionNumber: quotationRevisions.revisionNumber,
            grandTotal: quotationRevisions.grandTotal,
            subtotal: quotationRevisions.subtotal,
            totalCost: quotationRevisions.totalCost,
            totalMargin: quotationRevisions.totalMargin,
            overallMarginPercent: quotationRevisions.overallMarginPercent,
            negotiationNotes: quotationRevisions.negotiationNotes,
            createdAt: quotationRevisions.createdAt,
          })
          .from(quotationRevisions)
          .where(eq(quotationRevisions.quotationId, q.id))
          .orderBy(desc(quotationRevisions.revisionNumber));

        const [activeRev] = await db
          .select()
          .from(quotationRevisions)
          .where(
            sql`${quotationRevisions.quotationId} = ${q.id} AND ${quotationRevisions.revisionNumber} = ${q.currentRevision}`
          );

        return {
          ...q,
          subtotal: activeRev?.subtotal || 0,
          totalCost: activeRev?.totalCost || 0,
          totalMargin: activeRev?.totalMargin || 0,
          overallMarginPercent: activeRev?.overallMarginPercent || 0,
          negotiationNotes: activeRev?.negotiationNotes || null,
          gstRate: activeRev?.gstRate || 18,
          cgstAmount: activeRev?.cgstAmount || 0,
          sgstAmount: activeRev?.sgstAmount || 0,
          discountAmount: activeRev?.discountAmount || 0,
          grandTotal: activeRev?.grandTotal || 0,
          scopeOfWork: activeRev?.scopeOfWork || null,
          termsAndConditions: activeRev?.termsAndConditions || null,
          allRevisions: allRevs || [],
        };
      })
    );

    return NextResponse.json({ quotations: quotesWithDetails });
  } catch (error) {
    console.error("Fetch quotations error:", error);
    return NextResponse.json({ error: "Failed to fetch quotations" }, { status: 500 });
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
      clientId,
      enquiryId,
      scopeOfWork,
      termsAndConditions,
      bankAccountId,
      gstRate = 18.0,
      discountAmount = 0,
      items = [],
    } = body;

    if (!clientId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Client and at least one line item are required" },
        { status: 400 }
      );
    }

    // 1. Generate Quote Number: KG-Q-YYYY-XXX
    const year = new Date().getFullYear();
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(quotations);
    const nextSeq = String((countResult?.count || 0) + 1).padStart(3, "0");
    const quoteNumber = `KG-Q-${year}-${nextSeq}`;

    // Calculate subtotal and internal cost/margin from items
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

    // Get default terms if not provided
    let finalTerms = termsAndConditions;
    if (!finalTerms) {
      const [comp] = await db.select().from(companySettings).where(eq(companySettings.id, "primary"));
      finalTerms = comp?.defaultTerms || "Standard terms apply.";
    }

    // 2. Insert Quotation Master
    const quoteId = "quo_" + crypto.randomUUID().slice(0, 8);
    await db.insert(quotations).values({
      id: quoteId,
      clientId,
      enquiryId: enquiryId || null,
      quoteNumber,
      currentRevision: 1,
      status: "DRAFT",
      createdByUserId: user.id,
    });

    // 3. Insert Revision 1
    const revisionId = "rev_" + crypto.randomUUID().slice(0, 8);
    await db.insert(quotationRevisions).values({
      id: revisionId,
      quotationId: quoteId,
      revisionNumber: 1,
      subtotal,
      totalCost,
      totalMargin,
      overallMarginPercent,
      negotiationNotes: "Initial commercial quotation prepared.",
      gstRate: Number(gstRate),
      cgstAmount,
      sgstAmount,
      igstAmount: 0,
      discountAmount: Number(discountAmount) || 0,
      grandTotal,
      scopeOfWork: scopeOfWork || null,
      termsAndConditions: finalTerms,
      bankAccountId: bankAccountId || null,
    });

    // 4. Insert Items & Auto-save to Master Library if requested
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

      // If user flagged this item to be saved into Master BOQ Catalog
      if ((it as any).saveToMaster && it.description && it.unit) {
        try {
          const [exists] = await db
            .select()
            .from(masterItems)
            .where(sql`${masterItems.itemName} = ${it.description.slice(0, 50).trim()}`);

          if (!exists) {
            await db.insert(masterItems).values({
              id: "mi_" + crypto.randomUUID().slice(0, 8),
              category: it.category || "General Civil",
              itemName: it.description.slice(0, 50).trim(),
              description: it.description.trim(),
              unit: it.unit || "sq.ft",
              standardRate: Number(it.unitRate) || 0,
              hsnSacCode: it.hsnSacCode || "9954",
              isCustom: true,
            });
          }
        } catch (mErr) {
          console.error("Auto-save master item error:", mErr);
        }
      }
    }

    // 5. Update linked Enquiry status to QUOTATION_SENT
    if (enquiryId) {
      await db
        .update(enquiries)
        .set({ status: "QUOTATION_SENT", updatedAt: new Date().toISOString() })
        .where(eq(enquiries.id, enquiryId));
    }

    return NextResponse.json({
      success: true,
      quotationId: quoteId,
      quoteNumber,
      grandTotal,
    });
  } catch (error) {
    console.error("Create quotation error:", error);
    return NextResponse.json({ error: "Failed to create quotation" }, { status: 500 });
  }
}

