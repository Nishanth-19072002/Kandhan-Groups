import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { networkGroups, networkContacts } from "@/lib/db/schema";
import { getAuthenticatedUser } from "@/lib/auth";
import { sql, eq } from "drizzle-orm";
import crypto from "crypto";

// GET all groups with count of contacts in each group
export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const groupsWithCounts = await db
      .select({
        id: networkGroups.id,
        name: networkGroups.name,
        description: networkGroups.description,
        createdAt: networkGroups.createdAt,
        contactsCount: sql<number>`cast(count(${networkContacts.id}) as integer)`,
      })
      .from(networkGroups)
      .leftJoin(networkContacts, eq(networkGroups.id, networkContacts.groupId))
      .groupBy(networkGroups.id)
      .orderBy(networkGroups.name);

    return NextResponse.json({ groups: groupsWithCounts });
  } catch (error) {
    console.error("Fetch network groups error:", error);
    return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 });
  }
}

// POST create a new group
export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Group name is required" }, { status: 400 });
    }

    const id = "grp_" + crypto.randomUUID().slice(0, 8);

    await db.insert(networkGroups).values({
      id,
      name: name.trim(),
      description: description ? description.trim() : null,
    });

    return NextResponse.json({ success: true, id, name: name.trim() });
  } catch (error) {
    console.error("Create network group error:", error);
    return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
  }
}

