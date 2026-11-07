import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { companyBankAccounts } from "@/lib/db/schema";
import { getAuthenticatedUser } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const banks = await db
      .select()
      .from(companyBankAccounts)
      .orderBy(desc(companyBankAccounts.isDefault), companyBankAccounts.bankName);

    return NextResponse.json({ banks });
  } catch (error) {
    console.error("Fetch bank accounts error:", error);
    return NextResponse.json({ error: "Failed to fetch bank accounts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { accountNickname, bankName, accountHolderName, accountNumber, ifscCode, branch, upiId, isDefault } = body;

    if (!bankName || !accountNumber || !ifscCode) {
      return NextResponse.json(
        { error: "Bank name, account number, and IFSC code are required." },
        { status: 400 }
      );
    }

    if (isDefault) {
      // Remove default from other banks
      await db.update(companyBankAccounts).set({ isDefault: false });
    }

    const newBankId = "bnk_" + crypto.randomUUID().slice(0, 8);
    await db.insert(companyBankAccounts).values({
      id: newBankId,
      accountNickname: accountNickname ? accountNickname.trim() : `${bankName} A/C`,
      bankName: bankName.trim(),
      accountHolderName: accountHolderName ? accountHolderName.trim() : "Kandhan Groups",
      accountNumber: accountNumber.trim(),
      ifscCode: ifscCode.trim().toUpperCase(),
      branch: branch ? branch.trim() : null,
      upiId: upiId ? upiId.trim() : null,
      isDefault: Boolean(isDefault),
    });

    return NextResponse.json({ success: true, id: newBankId });
  } catch (error) {
    console.error("Create bank error:", error);
    return NextResponse.json({ error: "Failed to create bank account" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, accountNickname, bankName, accountHolderName, accountNumber, ifscCode, branch, upiId, isDefault } = body;

    if (!id) {
      return NextResponse.json({ error: "Bank ID is required" }, { status: 400 });
    }

    if (isDefault) {
      await db.update(companyBankAccounts).set({ isDefault: false });
    }

    await db
      .update(companyBankAccounts)
      .set({
        accountNickname: accountNickname ? accountNickname.trim() : undefined,
        bankName: bankName ? bankName.trim() : undefined,
        accountHolderName: accountHolderName ? accountHolderName.trim() : undefined,
        accountNumber: accountNumber ? accountNumber.trim() : undefined,
        ifscCode: ifscCode ? ifscCode.trim().toUpperCase() : undefined,
        branch: branch !== undefined ? (branch ? branch.trim() : null) : undefined,
        upiId: upiId !== undefined ? (upiId ? upiId.trim() : null) : undefined,
        isDefault: Boolean(isDefault),
      })
      .where(eq(companyBankAccounts.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update bank error:", error);
    return NextResponse.json({ error: "Failed to update bank account" }, { status: 500 });
  }
}

