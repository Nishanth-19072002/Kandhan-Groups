import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { enquiries, clients, followups } from "@/lib/db/schema";
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
        id: enquiries.id,
        workType: enquiries.workType,
        siteLocation: enquiries.siteLocation,
        description: enquiries.description,
        estimatedBudget: enquiries.estimatedBudget,
        status: enquiries.status,
        createdAt: enquiries.createdAt,
        clientId: clients.id,
        clientName: clients.name,
        clientPhone: clients.phone,
        clientEmail: clients.email,
        companyName: clients.companyName,
        gstin: clients.gstin,
        billingAddress: clients.billingAddress,
      })
      .from(enquiries)
      .innerJoin(clients, eq(enquiries.clientId, clients.id))
      .orderBy(desc(enquiries.createdAt));

    const followupCounts = await db
      .select({
        enquiryId: followups.enquiryId,
        count: sql<number>`count(*)`,
      })
      .from(followups)
      .groupBy(followups.enquiryId);

    const countsMap = new Map(followupCounts.map((f) => [f.enquiryId, f.count]));
    const enquiriesWithCounts = list.map((e) => ({
      ...e,
      followupCount: countsMap.get(e.id) || 0,
    }));

    return NextResponse.json({ enquiries: enquiriesWithCounts });
  } catch (error) {
    console.error("Fetch enquiries error:", error);
    return NextResponse.json({ error: "Failed to fetch enquiries" }, { status: 500 });
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
      clientId: incomingClientId,
      name,
      phone,
      email,
      companyName,
      gstin,
      billingAddress,
      workType,
      siteLocation,
      description,
      estimatedBudget,
      followupChannel,
      followupNotes,
      nextReminderDate,
    } = body;

    // 1. Find existing client or create new client profile
    let client;
    if (incomingClientId) {
      [client] = await db.select().from(clients).where(eq(clients.id, incomingClientId));
    }

    if (!client) {
      if (!name || !phone || !workType || !siteLocation) {
        return NextResponse.json(
          { error: "Client name, phone, work type, and site location are required" },
          { status: 400 }
        );
      }

      const cleanPhone = phone.trim();
      const [existingByPhone] = await db.select().from(clients).where(eq(clients.phone, cleanPhone));

      if (existingByPhone) {
        client = existingByPhone;
      } else {
        const newClientId = "cli_" + crypto.randomUUID().slice(0, 8);
        await db.insert(clients).values({
          id: newClientId,
          name: name.trim(),
          phone: cleanPhone,
          email: email ? email.trim().toLowerCase() : null,
          companyName: companyName ? companyName.trim() : null,
          gstin: gstin ? gstin.trim().toUpperCase() : null,
          billingAddress: billingAddress || null,
          siteAddress: siteLocation,
        });

        const [createdClient] = await db.select().from(clients).where(eq(clients.id, newClientId));
        client = createdClient;
      }
    } else {
      if (!workType || !siteLocation) {
        return NextResponse.json(
          { error: "Work type and site location are required for enquiry" },
          { status: 400 }
        );
      }
    }

    // 2. Create Enquiry
    const enquiryId = "enq_" + crypto.randomUUID().slice(0, 8);
    await db.insert(enquiries).values({
      id: enquiryId,
      clientId: client.id,
      assignedToUserId: user.id,
      workType,
      siteLocation,
      description: description || null,
      estimatedBudget: estimatedBudget ? Number(estimatedBudget) : null,
      status: "NEW",
    });

    // 3. Create initial log / follow-up entry
    const followupId = "fu_" + crypto.randomUUID().slice(0, 8);
    const initialNotes =
      followupNotes && followupNotes.trim()
        ? followupNotes.trim()
        : description && description.trim()
        ? `Initial enquiry logged: ${description.trim()}`
        : `Lead created by ${user.name} (${user.role}). Initial request: ${workType} at ${siteLocation}.`;

    await db.insert(followups).values({
      id: followupId,
      enquiryId,
      userId: user.id,
      channel: followupChannel || "PHONE_CALL",
      notes: initialNotes,
      followupDate: new Date().toISOString().split("T")[0],
      nextReminderDate: nextReminderDate || null,
    });

    return NextResponse.json({ success: true, enquiryId, clientId: client.id });
  } catch (error) {
    console.error("Create enquiry error:", error);
    return NextResponse.json({ error: "Failed to create enquiry" }, { status: 500 });
  }
}

