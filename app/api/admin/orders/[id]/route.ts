import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  orderConfirmations,
  salesInvoices,
  purchaseBills,
  clients,
  quotations,
  quotationRevisions,
  quotationItems,
  companySettings,
  companyBankAccounts,
} from "@/lib/db/schema";
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
    const [order] = await db
      .select({
        id: orderConfirmations.id,
        orderNumber: orderConfirmations.orderNumber,
        clientPoReference: orderConfirmations.clientPoReference,
        signedContractUrl: orderConfirmations.signedContractUrl,
        contractTerms: orderConfirmations.contractTerms,
        agreedContractValue: orderConfirmations.agreedContractValue,
        advanceAgreed: orderConfirmations.advanceAgreed,
        startDate: orderConfirmations.startDate,
        expectedCompletionDate: orderConfirmations.expectedCompletionDate,
        bankAccountId: orderConfirmations.bankAccountId,
        status: orderConfirmations.status,
        createdAt: orderConfirmations.createdAt,
        clientId: clients.id,
        clientName: clients.name,
        clientPhone: clients.phone,
        clientEmail: clients.email,
        companyName: clients.companyName,
        gstin: clients.gstin,
        billingAddress: clients.billingAddress,
        siteAddress: clients.siteAddress,
        quotationId: quotations.id,
        quoteNumber: quotations.quoteNumber,
        confirmedRevisionId: orderConfirmations.confirmedRevisionId,
      })
      .from(orderConfirmations)
      .innerJoin(clients, eq(orderConfirmations.clientId, clients.id))
      .innerJoin(quotations, eq(orderConfirmations.quotationId, quotations.id))
      .where(eq(orderConfirmations.id, id));

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Fetch items from confirmed revision
    const items = await db
      .select()
      .from(quotationItems)
      .where(eq(quotationItems.revisionId, order.confirmedRevisionId))
      .orderBy(quotationItems.itemOrder);

    // Fetch company settings
    const [company] = await db.select().from(companySettings).where(eq(companySettings.id, "primary"));

    // Fetch bank account
    let bankAccount = null;
    if (order.bankAccountId) {
      const [b] = await db.select().from(companyBankAccounts).where(eq(companyBankAccounts.id, order.bankAccountId));
      bankAccount = b;
    }
    if (!bankAccount) {
      const [defaultBank] = await db.select().from(companyBankAccounts).where(eq(companyBankAccounts.isDefault, true));
      bankAccount = defaultBank;
    }

    return NextResponse.json({
      order,
      items,
      company,
      bankAccount,
    });
  } catch (error) {
    console.error("Fetch order error:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
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
      startDate,
      expectedCompletionDate,
      agreedContractValue,
      advanceAgreed,
      clientPoReference,
      signedContractUrl,
      contractTerms,
      bankAccountId,
      status,
      assignedEngineerId,
    } = body;

    await db
      .update(orderConfirmations)
      .set({
        startDate: startDate || undefined,
        expectedCompletionDate: expectedCompletionDate !== undefined ? expectedCompletionDate : undefined,
        agreedContractValue: agreedContractValue !== undefined ? Number(agreedContractValue) : undefined,
        advanceAgreed: advanceAgreed !== undefined ? Number(advanceAgreed) : undefined,
        clientPoReference: clientPoReference !== undefined ? clientPoReference : undefined,
        signedContractUrl: signedContractUrl !== undefined ? signedContractUrl : undefined,
        contractTerms: contractTerms !== undefined ? contractTerms : undefined,
        bankAccountId: bankAccountId !== undefined ? bankAccountId : undefined,
        status: status || undefined,
        assignedEngineerId: assignedEngineerId !== undefined ? assignedEngineerId : undefined,
      })
      .where(eq(orderConfirmations.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Edit order error:", error);
    return NextResponse.json({ error: "Failed to edit order" }, { status: 500 });
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
    // Check if sales invoices exist for this order
    const [invoice] = await db
      .select()
      .from(salesInvoices)
      .where(eq(salesInvoices.orderConfirmationId, id));

    if (invoice) {
      return NextResponse.json(
        { error: `Cannot delete order: Invoice ${invoice.invoiceNumber} is linked. Delete or unlink the invoice first.` },
        { status: 400 }
      );
    }

    // Unlink purchase bills
    await db
      .update(purchaseBills)
      .set({ orderConfirmationId: null })
      .where(eq(purchaseBills.orderConfirmationId, id));

    // Delete order
    await db.delete(orderConfirmations).where(eq(orderConfirmations.id, id));

    return NextResponse.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("Delete order error:", error);
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
