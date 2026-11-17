import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { networkCategories, contactSupplies } from "@/lib/db/schema";
import { getAuthenticatedUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

// PUT update category
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
    const { department, name, aliases, defaultUnit, description } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Item name is required" }, { status: 400 });
    }

    const cleanDepartment = ["MATERIALS", "TRADES_LABOR", "EQUIPMENT", "SERVICES"].includes(department)
      ? department
      : undefined;

    await db
      .update(networkCategories)
      .set({
        department: cleanDepartment as "MATERIALS" | "TRADES_LABOR" | "EQUIPMENT" | "SERVICES" | undefined,
        name: name.trim(),
        aliases: aliases !== undefined ? (aliases ? aliases.trim() : null) : undefined,
        defaultUnit: defaultUnit !== undefined ? (defaultUnit ? defaultUnit.trim() : null) : undefined,
        description: description !== undefined ? (description ? description.trim() : null) : undefined,
      })
      .where(eq(networkCategories.id, id));

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

// DELETE category (cascades to contact_supplies)
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
    // Delete contact_supplies referencing this category first (safety check)
    await db.delete(contactSupplies).where(eq(contactSupplies.categoryId, id));
    // Delete category
    await db.delete(networkCategories).where(eq(networkCategories.id, id));

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
