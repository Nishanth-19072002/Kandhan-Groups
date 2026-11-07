import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { companySettings } from "@/lib/db/schema";
import { getAuthenticatedUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const [settings] = await db.select().from(companySettings).where(eq(companySettings.id, "primary"));
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Fetch settings error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      companyName,
      address,
      phone,
      email,
      gstin,
      pan,
      bankName,
      accountNumber,
      ifscCode,
      branch,
      defaultTerms,
    } = body;

    const [existing] = await db.select().from(companySettings).where(eq(companySettings.id, "primary"));

    if (existing) {
      await db
        .update(companySettings)
        .set({
          companyName: companyName?.trim() || "Kandhan Groups",
          address: address || null,
          phone: phone || null,
          email: email || null,
          gstin: gstin ? gstin.trim().toUpperCase() : null,
          pan: pan ? pan.trim().toUpperCase() : null,
          bankName: bankName || null,
          accountNumber: accountNumber || null,
          ifscCode: ifscCode || null,
          branch: branch || null,
          defaultTerms: defaultTerms || null,
        })
        .where(eq(companySettings.id, "primary"));
    } else {
      await db.insert(companySettings).values({
        id: "primary",
        companyName: companyName?.trim() || "Kandhan Groups",
        address,
        phone,
        email,
        gstin,
        pan,
        bankName,
        accountNumber,
        ifscCode,
        branch,
        defaultTerms,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}

