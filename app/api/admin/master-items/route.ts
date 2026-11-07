import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { masterItems } from "@/lib/db/schema";
import { getAuthenticatedUser } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await db
      .select()
      .from(masterItems)
      .orderBy(masterItems.category, masterItems.itemName);

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Fetch master items error:", error);
    return NextResponse.json({ error: "Failed to fetch master items" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { category, itemName, description, unit, standardRate, hsnSacCode, isCustom = true } = body;

    if (!category || !itemName || !unit) {
      return NextResponse.json(
        { error: "Category, item name, and unit of measurement are required." },
        { status: 400 }
      );
    }

    const newItemId = "mi_" + crypto.randomUUID().slice(0, 8);
    await db.insert(masterItems).values({
      id: newItemId,
      category: category.trim(),
      itemName: itemName.trim(),
      description: description ? description.trim() : itemName.trim(),
      unit: unit.trim(),
      standardRate: Number(standardRate) || 0,
      hsnSacCode: hsnSacCode ? hsnSacCode.trim() : "9954",
      isCustom: Boolean(isCustom),
    });

    return NextResponse.json({ success: true, id: newItemId });
  } catch (error) {
    console.error("Create master item error:", error);
    return NextResponse.json({ error: "Failed to create master item" }, { status: 500 });
  }
}

