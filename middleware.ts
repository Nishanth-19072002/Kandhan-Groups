import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "kandhan-groups-super-secret-jwt-key-2026"
);

const COOKIE_NAME = "kg_admin_session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect /admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const isLoginPage = pathname === "/admin/login";
  const token = req.cookies.get(COOKIE_NAME)?.value;

  let session: { userId: string; role: string; name: string } | null = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      session = payload as { userId: string; role: string; name: string };
    } catch {
      session = null;
    }
  }

  // 1. If on login page and already authenticated, redirect to dashboard
  if (isLoginPage) {
    if (session) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // 2. If not authenticated, redirect to login
  if (!session) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Root /admin redirect to /admin/dashboard
  if (pathname === "/admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  // 4. Role-based restrictions: Site Engineer cannot access GST, Settings, Users, or Backups
  if (session.role === "SITE_ENGINEER") {
    if (
      pathname.startsWith("/admin/gst") ||
      pathname.startsWith("/admin/settings") ||
      pathname.startsWith("/admin/users") ||
      pathname.startsWith("/admin/backups")
    ) {
      return NextResponse.redirect(new URL("/admin/dashboard?error=unauthorized", req.url));
    }
  }

  // 5. Accountant cannot access Backups, Users, or System Settings
  if (session.role === "ACCOUNTANT") {
    if (
      pathname.startsWith("/admin/backups") ||
      pathname.startsWith("/admin/users") ||
      pathname.startsWith("/admin/settings")
    ) {
      return NextResponse.redirect(new URL("/admin/dashboard?error=unauthorized", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

