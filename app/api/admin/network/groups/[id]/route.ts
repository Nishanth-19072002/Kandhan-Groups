import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { networkGroups } from "@/lib/db/schema";
import { getAuthenticatedUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

// PUT edit group
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
    const { name, description } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Group name is required" }, { status: 400 });
    }

    await db
      .update(networkGroups)
      .set({
        name: name.trim(),
        description: description ? description.trim() : null,
      })
      .where(eq(networkGroups.id, id));

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Update network group error:", error);
    return NextResponse.json({ error: "Failed to update group" }, { status: 500 });
  }
}

// DELETE group (cascades to contacts)
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
    await db.delete(networkGroups).where(eq(networkGroups.id, id));
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error("Delete network group error:", error);
    return NextResponse.json({ error: "Failed to delete group" }, { status: 500 });
  }
}

