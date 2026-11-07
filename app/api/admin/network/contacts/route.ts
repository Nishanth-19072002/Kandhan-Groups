import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { networkContacts, networkGroups } from "@/lib/db/schema";
import { getAuthenticatedUser } from "@/lib/auth";
import { eq, desc, and } from "drizzle-orm";
import crypto from "crypto";

// GET contacts with optional filter by groupId
export async function GET(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get("groupId");

  try {
    let query = db
      .select({
        id: networkContacts.id,
        groupId: networkContacts.groupId,
        groupName: networkGroups.name,
        firmName: networkContacts.firmName,
        contactPerson: networkContacts.contactPerson,
        phone: networkContacts.phone,
        alternatePhone: networkContacts.alternatePhone,
        email: networkContacts.email,
        city: networkContacts.city,
        areaLocality: networkContacts.areaLocality,
        fullAddress: networkContacts.fullAddress,
        standardRate: networkContacts.standardRate,
        rateUnit: networkContacts.rateUnit,
        paymentTerms: networkContacts.paymentTerms,
        description: networkContacts.description,
        rating: networkContacts.rating,
        tierLevel: networkContacts.tierLevel,
        gstin: networkContacts.gstin,
        isActive: networkContacts.isActive,
        createdAt: networkContacts.createdAt,
        updatedAt: networkContacts.updatedAt,
      })
      .from(networkContacts)
      .innerJoin(networkGroups, eq(networkContacts.groupId, networkGroups.id))
      .orderBy(desc(networkContacts.createdAt));

    const contacts = groupId
      ? await query.where(eq(networkContacts.groupId, groupId))
      : await query;

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error("Fetch network contacts error:", error);
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}

// POST create contact
export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      groupId,
      firmName,
      contactPerson,
      phone,
      alternatePhone,
      email,
      city,
      areaLocality,
      fullAddress,
      standardRate,
      rateUnit,
      paymentTerms,
      description,
      rating = 5,
      tierLevel = "TIER_1",
      gstin,
    } = body;

    if (!groupId) {
      return NextResponse.json({ error: "Group selection is required" }, { status: 400 });
    }
    if (!contactPerson || !phone || !city) {
      return NextResponse.json(
        { error: "Contact Person, Phone Number, and City are required" },
        { status: 400 }
      );
    }

    const id = "cnt_" + crypto.randomUUID().slice(0, 8);

    await db.insert(networkContacts).values({
      id,
      groupId,
      firmName: firmName ? firmName.trim() : null,
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      alternatePhone: alternatePhone ? alternatePhone.trim() : null,
      email: email ? email.trim() : null,
      city: city.trim(),
      areaLocality: areaLocality ? areaLocality.trim() : null,
      fullAddress: fullAddress ? fullAddress.trim() : null,
      standardRate: standardRate ? standardRate.trim() : null,
      rateUnit: rateUnit ? rateUnit.trim() : null,
      paymentTerms: paymentTerms ? paymentTerms.trim() : null,
      description: description ? description.trim() : null,
      rating: Number(rating) || 5,
      tierLevel: tierLevel || "TIER_1",
      gstin: gstin ? gstin.trim() : null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Create network contact error:", error);
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
  }
}

