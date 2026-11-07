import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "kandhan-groups-super-secret-jwt-key-2026"
);

export const COOKIE_NAME = "kg_admin_session";

export type UserRole = "SUPER_ADMIN" | "SITE_ENGINEER" | "ACCOUNTANT";

export interface SessionPayload {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
}

// Create signed JWT token
export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

// Verify JWT token
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// Server-side helper to get current logged-in user
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

// Verify user exists and is active in DB
export async function getAuthenticatedUser() {
  const session = await getSession();
  if (!session) return null;

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      phone: users.phone,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.id, session.userId));

  if (!user || user.isActive === 0) return null;
  return user;
}

