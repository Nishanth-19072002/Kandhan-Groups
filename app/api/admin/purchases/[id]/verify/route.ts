import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { purchaseBills } from "@/lib/db/schema";
import { getAuthenticatedUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role === "SITE_ENGINEER") {
    return NextResponse.json({ error: "Only Accountant or Super Admin can verify purchase bills" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const [bill] = await db.select().from(purchaseBills).where(eq(purchaseBills.id, id));
    if (!bill) {
      return NextResponse.json({ error: "Purchase bill not found" }, { status: 404 });
    }

    const newVerifiedState = bill.verifiedByAccountant === 1 ? 0 : 1;

    await db
      .update(purchaseBills)
      .set({ verifiedByAccountant: newVerifiedState })
      .where(eq(purchaseBills.id, id));

    return NextResponse.json({ success: true, verified: newVerifiedState === 1 });
  } catch (error) {
    console.error("Verify bill error:", error);
    return NextResponse.json({ error: "Failed to verify purchase bill" }, { status: 500 });
  }
}

