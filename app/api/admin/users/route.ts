import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getAuthenticatedUser } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Only Super Admin can manage team users." }, { status: 403 });
  }

  try {
    const list = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    return NextResponse.json({ users: list });
  } catch (error) {
    console.error("Fetch users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Only Super Admin can create users." }, { status: 403 });
  }

  try {
    const { name, email, password, phone, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Name, email, password, and role are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if email already exists
    const [existing] = await db.select().from(users).where(eq(users.email, cleanEmail));
    if (existing) {
      return NextResponse.json({ error: "A user with this email already exists." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = "usr_" + crypto.randomUUID().slice(0, 8);

    await db.insert(users).values({
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : null,
      passwordHash,
      role,
      isActive: 1,
    });

    return NextResponse.json({
      success: true,
      userId,
      message: `User ${name} created with role ${role}.`,
    });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

