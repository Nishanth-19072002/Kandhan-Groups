import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orderConfirmations, clients, quotations, users } from "@/lib/db/schema";
import { getAuthenticatedUser } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const list = await db
      .select({
        id: orderConfirmations.id,
        orderNumber: orderConfirmations.orderNumber,
        clientPoReference: orderConfirmations.clientPoReference,
        agreedContractValue: orderConfirmations.agreedContractValue,
        advanceAgreed: orderConfirmations.advanceAgreed,
        signedContractUrl: orderConfirmations.signedContractUrl,
        contractTerms: orderConfirmations.contractTerms,
        bankAccountId: orderConfirmations.bankAccountId,
        startDate: orderConfirmations.startDate,
        expectedCompletionDate: orderConfirmations.expectedCompletionDate,
        status: orderConfirmations.status,
        createdAt: orderConfirmations.createdAt,
        clientId: clients.id,
        clientName: clients.name,
        clientPhone: clients.phone,
        companyName: clients.companyName,
        quotationId: quotations.id,
        quoteNumber: quotations.quoteNumber,
        engineerName: users.name,
      })
      .from(orderConfirmations)
      .innerJoin(clients, eq(orderConfirmations.clientId, clients.id))
      .innerJoin(quotations, eq(orderConfirmations.quotationId, quotations.id))
      .leftJoin(users, eq(orderConfirmations.assignedEngineerId, users.id))
      .orderBy(desc(orderConfirmations.createdAt));

    return NextResponse.json({ orders: list });
  } catch (error) {
    console.error("Fetch orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

