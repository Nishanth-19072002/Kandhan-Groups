import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { vendors } from "@/lib/db/schema";
import { getAuthenticatedUser } from "@/lib/auth";
import { desc } from "drizzle-orm";
import crypto from "crypto";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const list = await db.select().from(vendors).orderBy(desc(vendors.createdAt));
    return NextResponse.json({ vendors: list });
  } catch (error) {
    console.error("Fetch vendors error:", error);
    return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, phone, gstin, category, contactPerson, email, address, bankDetails } = await req.json();

    if (!name || !phone || !category) {
      return NextResponse.json({ error: "Vendor name, phone, and category are required" }, { status: 400 });
    }

    const vendorId = "ven_" + crypto.randomUUID().slice(0, 8);
    await db.insert(vendors).values({
      id: vendorId,
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : null,
      gstin: gstin ? gstin.trim().toUpperCase() : null,
      category,
      contactPerson: contactPerson || null,
      address: address || null,
      bankDetails: bankDetails || null,
    });

    return NextResponse.json({ success: true, vendorId });
  } catch (error) {
    console.error("Create vendor error:", error);
    return NextResponse.json({ error: "Failed to create vendor" }, { status: 500 });
  }
}

