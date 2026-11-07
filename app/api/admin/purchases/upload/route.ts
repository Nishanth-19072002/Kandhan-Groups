import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name) || ".jpg";
    const uniqueFileName = `bill_${Date.now()}_${crypto.randomUUID().slice(0, 6)}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "bills");
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, uniqueFileName);
    await fs.writeFile(filePath, buffer);

    const fileUrl = `/uploads/bills/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error("Upload bill error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}

