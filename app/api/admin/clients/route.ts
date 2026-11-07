import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clients, enquiries, quotations, quotationRevisions, orderConfirmations, salesInvoices, auditLogs } from "@/lib/db/schema";
import { getAuthenticatedUser } from "@/lib/auth";
import { desc, eq, sql } from "drizzle-orm";
import crypto from "crypto";

// GET /api/admin/clients - List all clients with aggregated stats
export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allClients = await db.select().from(clients).orderBy(desc(clients.createdAt));

    // Fetch stats for each client
    const clientsWithStats = await Promise.all(
      allClients.map(async (c) => {
        const [enqCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(enquiries)
          .where(eq(enquiries.clientId, c.id));

        const [quoteCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(quotations)
          .where(eq(quotations.clientId, c.id));

        const [ordersCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(orderConfirmations)
          .where(eq(orderConfirmations.clientId, c.id));

        // Total pipeline value from active revisions
        const quotes = await db
          .select({ id: quotations.id, currentRevision: quotations.currentRevision })
          .from(quotations)
          .where(eq(quotations.clientId, c.id));

        let totalPipeline = 0;
        for (const q of quotes) {
          const [rev] = await db
            .select({ grandTotal: quotationRevisions.grandTotal })
            .from(quotationRevisions)
            .where(
              sql`${quotationRevisions.quotationId} = ${q.id} AND ${quotationRevisions.revisionNumber} = ${q.currentRevision}`
            );
          if (rev) totalPipeline += rev.grandTotal;
        }

        return {
          ...c,
          totalEnquiries: enqCount?.count || 0,
          totalQuotations: quoteCount?.count || 0,
          totalWorkOrders: ordersCount?.count || 0,
          totalPipelineValue: totalPipeline,
        };
      })
    );

    return NextResponse.json({ clients: clientsWithStats });
  } catch (err: unknown) {
    console.error("Fetch clients error:", err);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

// POST /api/admin/clients - Create a new client profile
export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, phone, email, companyName, gstin, billingAddress, siteAddress } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: "Client name and phone number are required" }, { status: 400 });
    }

    const clientId = "cl_" + crypto.randomUUID().slice(0, 8);
    await db.insert(clients).values({
      id: clientId,
      name,
      phone,
      email: email || null,
      companyName: companyName || null,
      gstin: gstin ? gstin.toUpperCase().trim() : null,
      billingAddress: billingAddress || null,
      siteAddress: siteAddress || null,
    });

    await db.insert(auditLogs).values({
      id: "aud_" + crypto.randomUUID().slice(0, 8),
      userId: user.id,
      action: "CREATE_CLIENT",
      entityType: "clients",
      entityId: clientId,
      details: `Created client ${name} (${companyName || "Direct"}) - Phone: ${phone}`,
    });

    return NextResponse.json({ success: true, clientId });
  } catch (err: unknown) {
    console.error("Create client error:", err);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}

