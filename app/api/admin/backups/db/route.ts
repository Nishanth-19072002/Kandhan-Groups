import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Only Super Admin can download raw database backups." }, { status: 403 });
  }

  try {
    const dbPath = path.join(process.cwd(), "kandhan_dev.db");
    const fileBuffer = await fs.readFile(dbPath);

    const today = new Date().toISOString().split("T")[0];

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/vnd.sqlite3",
        "Content-Disposition": `attachment; filename="kandhan_groups_backup_${today}.db"`,
        "Content-Length": String(fileBuffer.length),
      },
    });
  } catch (error) {
    console.error("DB download error:", error);
    return NextResponse.json({ error: "Failed to download database file." }, { status: 500 });
  }
}

