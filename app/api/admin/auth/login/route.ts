import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { signSession, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const identifier = (body.username || body.email || "").trim().toLowerCase();
    const password = body.password;

    if (!identifier || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    // Support logging in via direct username (e.g. 'admin', 'nishanth') or full email (e.g. 'admin@kandhangroups.com')
    const candidates = [
      identifier,
      identifier.includes("@") ? identifier : `${identifier}@kandhangroups.com`,
    ];

    let user = null;
    for (const cand of candidates) {
      const [found] = await db.select().from(users).where(eq(users.email, cand));
      if (found) {
        user = found;
        break;
      }
    }

    if (!user || user.isActive === 0) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await signSession({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

