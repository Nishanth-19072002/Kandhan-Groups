import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { networkContacts, networkGroups, contactSupplies, networkCategories } from "@/lib/db/schema";
import { getAuthenticatedUser } from "@/lib/auth";
import { eq, desc, inArray } from "drizzle-orm";
import crypto from "crypto";

export interface ContactSupplyItem {
  id?: string;
  categoryId: string;
  categoryName?: string;
  department?: string;
  brandOrSpecs?: string | null;
  standardRate?: string | null;
  rateUnit?: string | null;
  notes?: string | null;
}

// GET contacts with attached supplies and optional filters
export async function GET(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get("groupId");
  const categoryId = searchParams.get("categoryId");
  const department = searchParams.get("department");
  const search = searchParams.get("search")?.toLowerCase().trim();

  try {
    // 1. Fetch contacts
    let contactsQuery = db
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
      .leftJoin(networkGroups, eq(networkContacts.groupId, networkGroups.id))
      .orderBy(desc(networkContacts.createdAt));

    let contacts = await contactsQuery;

    if (groupId) {
      contacts = contacts.filter((c) => c.groupId === groupId);
    }

    if (contacts.length === 0) {
      return NextResponse.json({ contacts: [] });
    }

    // 2. Fetch all linked supplies with category info
    const contactIds = contacts.map((c) => c.id);
    const suppliesRows = await db
      .select({
        id: contactSupplies.id,
        contactId: contactSupplies.contactId,
        categoryId: contactSupplies.categoryId,
        categoryName: networkCategories.name,
        department: networkCategories.department,
        aliases: networkCategories.aliases,
        defaultUnit: networkCategories.defaultUnit,
        brandOrSpecs: contactSupplies.brandOrSpecs,
        standardRate: contactSupplies.standardRate,
        rateUnit: contactSupplies.rateUnit,
        notes: contactSupplies.notes,
      })
      .from(contactSupplies)
      .innerJoin(networkCategories, eq(contactSupplies.categoryId, networkCategories.id))
      .where(inArray(contactSupplies.contactId, contactIds));

    // Group supplies by contactId
    const suppliesMap: Record<string, typeof suppliesRows> = {};
    for (const sup of suppliesRows) {
      if (!suppliesMap[sup.contactId]) {
        suppliesMap[sup.contactId] = [];
      }
      suppliesMap[sup.contactId].push(sup);
    }

    // Combine contacts with their supplies
    let enrichedContacts = contacts.map((c) => ({
      ...c,
      supplies: suppliesMap[c.id] || [],
    }));

    // Filter by categoryId if given
    if (categoryId && categoryId !== "ALL") {
      enrichedContacts = enrichedContacts.filter((c) =>
        c.supplies.some((s) => s.categoryId === categoryId)
      );
    }

    // Filter by department if given
    if (department && department !== "ALL") {
      enrichedContacts = enrichedContacts.filter((c) =>
        c.supplies.some((s) => s.department === department)
      );
    }

    // Filter by search keyword (fuzzy matches firm, person, phone, city, item names, aliases, brands)
    if (search) {
      enrichedContacts = enrichedContacts.filter((c) => {
        const textToSearch = [
          c.firmName || "",
          c.contactPerson || "",
          c.phone || "",
          c.city || "",
          c.areaLocality || "",
          c.description || "",
          ...c.supplies.map(
            (s) => `${s.categoryName || ""} ${s.aliases || ""} ${s.brandOrSpecs || ""}`
          ),
        ]
          .join(" ")
          .toLowerCase();

        return textToSearch.includes(search);
      });
    }

    return NextResponse.json({ contacts: enrichedContacts });
  } catch (error) {
    console.error("Fetch network contacts error:", error);
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}

// POST create contact with multi-item supplies
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
      supplies = [], // Array of { categoryId, brandOrSpecs, standardRate, rateUnit, notes } or categoryId strings
    } = body;

    if (!contactPerson || !phone || !city) {
      return NextResponse.json(
        { error: "Contact Person, Primary Phone Number, and City are required" },
        { status: 400 }
      );
    }

    const contactId = "cnt_" + crypto.randomUUID().slice(0, 8);

    // Insert contact
    await db.insert(networkContacts).values({
      id: contactId,
      groupId: groupId || null,
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

    // Insert linked supplies
    if (Array.isArray(supplies) && supplies.length > 0) {
      for (const item of supplies) {
        const catId = typeof item === "string" ? item : item.categoryId;
        if (!catId) continue;

        const supplyId = "sup_" + crypto.randomUUID().slice(0, 8);
        await db.insert(contactSupplies).values({
          id: supplyId,
          contactId: contactId,
          categoryId: catId,
          brandOrSpecs: typeof item === "object" && item.brandOrSpecs ? item.brandOrSpecs.trim() : null,
          standardRate: typeof item === "object" && item.standardRate ? item.standardRate.trim() : null,
          rateUnit: typeof item === "object" && item.rateUnit ? item.rateUnit.trim() : null,
          notes: typeof item === "object" && item.notes ? item.notes.trim() : null,
        });
      }
    }

    return NextResponse.json({ success: true, id: contactId });
  } catch (error) {
    console.error("Create network contact error:", error);
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
  }
}
