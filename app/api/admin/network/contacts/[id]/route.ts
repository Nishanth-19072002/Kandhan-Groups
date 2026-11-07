import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { networkContacts } from "@/lib/db/schema";
import { getAuthenticatedUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

// PUT update contact
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const {
      groupId,
      firmName,
      contactPerson,
      phone,
      alternatePhone,
      email,
      city,
      areaLocality,
      fullAddress,
      standardRate,
      rateUnit,
      paymentTerms,
      description,
      rating,
      tierLevel,
      gstin,
    } = body;

    if (!contactPerson || !phone || !city) {
      return NextResponse.json(
        { error: "Contact Person, Phone Number, and City are required" },
        { status: 400 }
      );
    }

    await db
      .update(networkContacts)
      .set({
        groupId: groupId || undefined,
        firmName: firmName !== undefined ? (firmName ? firmName.trim() : null) : undefined,
        contactPerson: contactPerson.trim(),
        phone: phone.trim(),
        alternatePhone: alternatePhone !== undefined ? (alternatePhone ? alternatePhone.trim() : null) : undefined,
        email: email !== undefined ? (email ? email.trim() : null) : undefined,
        city: city.trim(),
        areaLocality: areaLocality !== undefined ? (areaLocality ? areaLocality.trim() : null) : undefined,
        fullAddress: fullAddress !== undefined ? (fullAddress ? fullAddress.trim() : null) : undefined,
        standardRate: standardRate !== undefined ? (standardRate ? standardRate.trim() : null) : undefined,
        rateUnit: rateUnit !== undefined ? (rateUnit ? rateUnit.trim() : null) : undefined,
        paymentTerms: paymentTerms !== undefined ? (paymentTerms ? paymentTerms.trim() : null) : undefined,
        description: description !== undefined ? (description ? description.trim() : null) : undefined,
        rating: rating !== undefined ? Number(rating) : undefined,
        tierLevel: tierLevel || undefined,
        gstin: gstin !== undefined ? (gstin ? gstin.trim() : null) : undefined,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(networkContacts.id, id));

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Update network contact error:", error);
    return NextResponse.json({ error: "Failed to update contact" }, { status: 500 });
  }
}

// DELETE contact
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await db.delete(networkContacts).where(eq(networkContacts.id, id));
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error("Delete network contact error:", error);
    return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 });
  }
}

