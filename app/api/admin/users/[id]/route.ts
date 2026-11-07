import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getAuthenticatedUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getAuthenticatedUser();
  if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Only Super Admin can update users." }, { status: 403 });
  }

  const { id } = await params;

  try {
    const { role, isActive, password, name, phone } = await req.json();

    const [targetUser] = await db.select().from(users).where(eq(users.id, id));
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updates: any = { updatedAt: new Date().toISOString() };
    if (role) updates.role = role;
    if (isActive !== undefined) updates.isActive = isActive;
    if (name) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone ? phone.trim() : null;
    if (password) {
      updates.passwordHash = await bcrypt.hash(password, 10);
    }

    await db.update(users).set(updates).where(eq(users.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getAuthenticatedUser();
  if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Only Super Admin can delete users." }, { status: 403 });
  }

  const { id } = await params;

  try {
    // Prevent Super Admin from deleting their own account
    if (id === currentUser.id) {
      return NextResponse.json(
        { error: "You cannot delete your own active Super Admin account." },
        { status: 400 }
      );
    }

    const [targetUser] = await db.select().from(users).where(eq(users.id, id));
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await db.delete(users).where(eq(users.id, id));

    return NextResponse.json({ success: true, message: `User ${targetUser.name} deleted.` });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}

