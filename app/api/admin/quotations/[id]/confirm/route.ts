import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  quotations,
  quotationRevisions,
  orderConfirmations,
  enquiries,
  auditLogs,
} from "@/lib/db/schema";
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

  // Only Super Admin or Accountant can confirm quotes and issue Work Orders
  if (user.role === "SITE_ENGINEER") {
    return NextResponse.json(
      { error: "Only Super Admin or authorized management can confirm quotations." },
      { status: 403 }
    );
  }

  const { id } = await params;

  try {
    const [quote] = await db.select().from(quotations).where(eq(quotations.id, id));
    if (!quote) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    const [existingOrder] = await db
      .select()
      .from(orderConfirmations)
      .where(eq(orderConfirmations.quotationId, id));

    if (existingOrder) {
      return NextResponse.json({
        success: true,
        alreadyConfirmed: true,
        orderNumber: existingOrder.orderNumber,
        orderId: existingOrder.id,
        contractValue: existingOrder.agreedContractValue,
      });
    }

    const body = await req.json();
    const {
      clientPoReference,
      startDate,
      expectedCompletionDate,
      advanceAgreed,
      assignedEngineerId,
      contractTerms,
      bankAccountId,
      signedContractUrl,
    } = body;

    if (!startDate) {
      return NextResponse.json(
        { error: "Agreed project start date is required" },
        { status: 400 }
      );
    }

    // Get the active revision details
    const [activeRev] = await db
      .select()
      .from(quotationRevisions)
      .where(
        sql`${quotationRevisions.quotationId} = ${quote.id} AND ${quotationRevisions.revisionNumber} = ${quote.currentRevision}`
      );

    if (!activeRev) {
      return NextResponse.json({ error: "Active revision not found" }, { status: 404 });
    }

    // 1. Generate Work Order Number: KG-WO-YYYY-XXX
    const year = new Date().getFullYear();
    const [woCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orderConfirmations);
    const nextSeq = String((woCount?.count || 0) + 1).padStart(3, "0");
    const orderNumber = `KG-WO-${year}-${nextSeq}`;

    // 2. Insert Order Confirmation (Work Order)
    const orderId = "wo_" + crypto.randomUUID().slice(0, 8);
    await db.insert(orderConfirmations).values({
      id: orderId,
      orderNumber,
      enquiryId: quote.enquiryId || null,
      quotationId: quote.id,
      confirmedRevisionId: activeRev.id,
      clientId: quote.clientId,
      clientPoReference: clientPoReference || null,
      signedContractUrl: signedContractUrl || null,
      contractTerms: contractTerms || activeRev.termsAndConditions || null,
      bankAccountId: bankAccountId || activeRev.bankAccountId || null,
      agreedContractValue: activeRev.grandTotal,
      advanceAgreed: Number(advanceAgreed) || 0,
      startDate,
      expectedCompletionDate: expectedCompletionDate || null,
      assignedEngineerId: assignedEngineerId || null,
      status: "ACTIVE",
    });

    // 3. Mark Quotation as CONFIRMED (locks it)
    await db
      .update(quotations)
      .set({
        status: "CONFIRMED",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(quotations.id, quote.id));

    // 4. Update linked Enquiry to CONFIRMED
    if (quote.enquiryId) {
      await db
        .update(enquiries)
        .set({
          status: "CONFIRMED",
          updatedAt: new Date().toISOString(),
        })
        .where(eq(enquiries.id, quote.enquiryId));
    }

    // 5. Log audit trail
    await db.insert(auditLogs).values({
      id: "aud_" + crypto.randomUUID().slice(0, 8),
      userId: user.id,
      action: "CONFIRM_QUOTE_ISSUE_WORK_ORDER",
      entityType: "order_confirmations",
      entityId: orderId,
      details: `Quote ${quote.quoteNumber} (Rev ${quote.currentRevision}) confirmed. Work Order ${orderNumber} created for ₹${activeRev.grandTotal.toLocaleString("en-IN")}.`,
    });

    return NextResponse.json({
      success: true,
      orderNumber,
      orderId,
      contractValue: activeRev.grandTotal,
    });
  } catch (error) {
    console.error("Confirm quotation error:", error);
    return NextResponse.json({ error: "Failed to confirm quotation" }, { status: 500 });
  }
}

