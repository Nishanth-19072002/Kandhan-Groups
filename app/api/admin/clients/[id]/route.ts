import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  clients,
  enquiries,
  followups,
  quotations,
  quotationRevisions,
  quotationItems,
  orderConfirmations,
  salesInvoices,
  auditLogs,
} from "@/lib/db/schema";
import { getAuthenticatedUser } from "@/lib/auth";
import { eq, desc, sql } from "drizzle-orm";
import crypto from "crypto";

// GET /api/admin/clients/[id] - Client 360° Profile
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
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // 1. Enquiries
    const clientEnquiries = await db
      .select()
      .from(enquiries)
      .where(eq(enquiries.clientId, id))
      .orderBy(desc(enquiries.createdAt));

    // 2. Quotations with active revision totals
    const rawQuotes = await db
      .select()
      .from(quotations)
      .where(eq(quotations.clientId, id))
      .orderBy(desc(quotations.createdAt));

    const clientQuotations = await Promise.all(
      rawQuotes.map(async (q) => {
        const [rev] = await db
          .select()
          .from(quotationRevisions)
          .where(
            sql`${quotationRevisions.quotationId} = ${q.id} AND ${quotationRevisions.revisionNumber} = ${q.currentRevision}`
          );
        return {
          ...q,
          grandTotal: rev?.grandTotal || 0,
          subtotal: rev?.subtotal || 0,
        };
      })
    );

    // 3. Work Orders
    const clientOrders = await db
      .select()
      .from(orderConfirmations)
      .where(eq(orderConfirmations.clientId, id))
      .orderBy(desc(orderConfirmations.createdAt));

    // 4. Invoices
    const clientInvoices = await db
      .select()
      .from(salesInvoices)
      .where(eq(salesInvoices.clientId, id))
      .orderBy(desc(salesInvoices.createdAt));

    return NextResponse.json({
      client,
      enquiries: clientEnquiries,
      quotations: clientQuotations,
      orders: clientOrders,
      invoices: clientInvoices,
    });
  } catch (err: unknown) {
    console.error("Fetch client 360 error:", err);
    return NextResponse.json({ error: "Failed to fetch client profile" }, { status: 500 });
  }
}

// PUT /api/admin/clients/[id] - Update client details
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
    const { name, phone, email, companyName, gstin, billingAddress, siteAddress } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: "Client name and phone are required" }, { status: 400 });
    }

    await db
      .update(clients)
      .set({
        name,
        phone,
        email: email || null,
        companyName: companyName || null,
        gstin: gstin ? gstin.toUpperCase().trim() : null,
        billingAddress: billingAddress || null,
        siteAddress: siteAddress || null,
      })
      .where(eq(clients.id, id));

    await db.insert(auditLogs).values({
      id: "aud_" + crypto.randomUUID().slice(0, 8),
      userId: user.id,
      action: "UPDATE_CLIENT",
      entityType: "clients",
      entityId: id,
      details: `Updated client ${name} (${companyName || "Direct"})`,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Update client error:", err);
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
  }
}

// DELETE /api/admin/clients/[id] - Delete client profile
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
  }

  // Only Super Admin can delete clients
  if (user.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: `Only Super Admin can delete clients. You are logged in as ${user.role.replace("_", " ")}.` },
      { status: 403 }
    );
  }

  const { id } = await params;

  try {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    if (!client) {
      return NextResponse.json({ error: "Client not found or already deleted." }, { status: 404 });
    }

    // 1. Check if client has active work orders (ongoing construction contracts)
    const [activeOrders] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orderConfirmations)
      .where(eq(orderConfirmations.clientId, id));

    if ((activeOrders?.count || 0) > 0) {
      return NextResponse.json(
        { error: "Cannot delete client with active Work Orders / Projects. Complete or cancel orders first." },
        { status: 400 }
      );
    }

    // 2. Check if client has sales invoices on record
    const [invoiceCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(salesInvoices)
      .where(eq(salesInvoices.clientId, id));

    if ((invoiceCount?.count || 0) > 0) {
      return NextResponse.json(
        { error: "Cannot delete client with existing Tax Invoices on record. Void or remove invoices first." },
        { status: 400 }
      );
    }

    // 3. Cascade-delete linked quotations, revisions, and items cleanly
    const clientQuotes = await db
      .select({ id: quotations.id })
      .from(quotations)
      .where(eq(quotations.clientId, id));

    for (const q of clientQuotes) {
      const revs = await db
        .select({ id: quotationRevisions.id })
        .from(quotationRevisions)
        .where(eq(quotationRevisions.quotationId, q.id));

      for (const r of revs) {
        await db.delete(quotationItems).where(eq(quotationItems.revisionId, r.id));
      }
      await db.delete(quotationRevisions).where(eq(quotationRevisions.quotationId, q.id));
      await db.delete(quotations).where(eq(quotations.id, q.id));
    }

    // 4. Cascade-delete linked enquiries and followups
    const clientEnqs = await db
      .select({ id: enquiries.id })
      .from(enquiries)
      .where(eq(enquiries.clientId, id));

    for (const e of clientEnqs) {
      await db.delete(followups).where(eq(followups.enquiryId, e.id));
      await db.delete(enquiries).where(eq(enquiries.id, e.id));
    }

    // 5. Delete client record
    await db.delete(clients).where(eq(clients.id, id));

    // 6. Audit log entry
    await db.insert(auditLogs).values({
      id: "aud_" + crypto.randomUUID().slice(0, 8),
      userId: user.id,
      action: "DELETE_CLIENT",
      entityType: "clients",
      entityId: id,
      details: `Deleted client ${client.name} (${client.companyName || "Direct"})`,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Delete client error:", err);
    const message = err instanceof Error ? err.message : "Failed to delete client";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

