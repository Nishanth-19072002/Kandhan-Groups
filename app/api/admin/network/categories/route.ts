import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { networkCategories, contactSupplies } from "@/lib/db/schema";
import { getAuthenticatedUser } from "@/lib/auth";
import { sql, eq, desc, asc } from "drizzle-orm";
import crypto from "crypto";

// GET all categories with supply counts
export async function GET(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const department = searchParams.get("department");

  try {
    const categoriesWithCount = await db
      .select({
        id: networkCategories.id,
        department: networkCategories.department,
        name: networkCategories.name,
        aliases: networkCategories.aliases,
        defaultUnit: networkCategories.defaultUnit,
        description: networkCategories.description,
        createdAt: networkCategories.createdAt,
        supplierCount: sql<number>`cast(count(distinct ${contactSupplies.contactId}) as integer)`,
      })
      .from(networkCategories)
      .leftJoin(contactSupplies, eq(networkCategories.id, contactSupplies.categoryId))
      .groupBy(networkCategories.id)
      .orderBy(asc(networkCategories.department), asc(networkCategories.name));

    const filtered = department && department !== "ALL"
      ? categoriesWithCount.filter((c) => c.department === department)
      : categoriesWithCount;

    return NextResponse.json({ categories: filtered });
  } catch (error) {
    console.error("Fetch categories error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// POST create category
export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { department = "MATERIALS", name, aliases, defaultUnit, description } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Item / Category name is required" }, { status: 400 });
    }

    const cleanName = name.trim();
    const cleanDepartment = ["MATERIALS", "TRADES_LABOR", "EQUIPMENT", "SERVICES"].includes(department)
      ? department
      : "MATERIALS";

    // Check duplicate
    const existing = await db
      .select({ id: networkCategories.id })
      .from(networkCategories)
      .where(eq(networkCategories.name, cleanName));

    if (existing.length > 0) {
      return NextResponse.json(
        { error: `Item "${cleanName}" already exists in the registry.` },
        { status: 409 }
      );
    }

    const id = "cat_" + crypto.randomUUID().slice(0, 8);

    await db.insert(networkCategories).values({
      id,
      department: cleanDepartment as "MATERIALS" | "TRADES_LABOR" | "EQUIPMENT" | "SERVICES",
      name: cleanName,
      aliases: aliases ? aliases.trim() : null,
      defaultUnit: defaultUnit ? defaultUnit.trim() : "per unit",
      description: description ? description.trim() : null,
    });

    return NextResponse.json({
      success: true,
      category: {
        id,
        department: cleanDepartment,
        name: cleanName,
        aliases: aliases ? aliases.trim() : null,
        defaultUnit: defaultUnit ? defaultUnit.trim() : "per unit",
        description: description ? description.trim() : null,
        supplierCount: 0,
      },
    });
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}
