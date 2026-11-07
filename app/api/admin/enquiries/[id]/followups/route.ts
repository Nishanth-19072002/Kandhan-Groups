import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { followups, users } from "@/lib/db/schema";
import { getAuthenticatedUser } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const list = await db
      .select({
        id: followups.id,
        channel: followups.channel,
        notes: followups.notes,
        followupDate: followups.followupDate,
        nextReminderDate: followups.nextReminderDate,
        createdAt: followups.createdAt,
        userId: users.id,
        userName: users.name,
        userRole: users.role,
      })
      .from(followups)
      .innerJoin(users, eq(followups.userId, users.id))
      .where(eq(followups.enquiryId, id))
      .orderBy(desc(followups.createdAt));

    return NextResponse.json({ followups: list });
  } catch (error) {
    console.error("Fetch followups error:", error);
    return NextResponse.json({ error: "Failed to fetch followups" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { channel, notes, followupDate, nextReminderDate } = await req.json();

    if (!notes || !notes.trim()) {
      return NextResponse.json(
        { error: "Notes are required" },
        { status: 400 }
      );
    }

    const effectiveFollowupDate = followupDate || new Date().toISOString().split("T")[0];

    const followupId = "fu_" + crypto.randomUUID().slice(0, 8);
    await db.insert(followups).values({
      id: followupId,
      enquiryId: id,
      userId: user.id,
      channel: channel || "PHONE_CALL",
      notes: notes.trim(),
      followupDate: effectiveFollowupDate,
      nextReminderDate: nextReminderDate || null,
    });

    return NextResponse.json({ success: true, followupId });
  } catch (error) {
    console.error("Create followup error:", error);
    return NextResponse.json({ error: "Failed to create followup" }, { status: 500 });
  }
}

