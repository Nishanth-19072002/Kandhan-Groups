import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { enquiries, followups, clients, quotations } from "@/lib/db/schema";
import { getAuthenticatedUser } from "@/lib/auth";
import { eq } from "drizzle-orm";

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
    const [enq] = await db
      .select({
        id: enquiries.id,
        workType: enquiries.workType,
        siteLocation: enquiries.siteLocation,
        description: enquiries.description,
        estimatedBudget: enquiries.estimatedBudget,
        status: enquiries.status,
        createdAt: enquiries.createdAt,
        clientId: clients.id,
        clientName: clients.name,
        clientPhone: clients.phone,
        clientEmail: clients.email,
        companyName: clients.companyName,
        gstin: clients.gstin,
        billingAddress: clients.billingAddress,
      })
      .from(enquiries)
      .innerJoin(clients, eq(enquiries.clientId, clients.id))
      .where(eq(enquiries.id, id));

    if (!enq) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    return NextResponse.json({ enquiry: enq });
  } catch (error) {
    console.error("Fetch enquiry error:", error);
    return NextResponse.json({ error: "Failed to fetch enquiry" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { status } = await req.json();

    const validStatuses = [
      "NEW",
      "CONTACTED",
      "SITE_VISIT_SCHEDULED",
      "SITE_VISITED",
      "QUOTATION_SENT",
      "CONFIRMED",
      "LOST",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    await db
      .update(enquiries)
      .set({
        status,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(enquiries.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update enquiry error:", error);
    return NextResponse.json({ error: "Failed to update enquiry" }, { status: 500 });
  }
}

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
      name,
      phone,
      email,
      companyName,
      gstin,
      workType,
      siteLocation,
      description,
      estimatedBudget,
      status,
    } = body;

    const [existing] = await db
      .select({ clientId: enquiries.clientId })
      .from(enquiries)
      .where(eq(enquiries.id, id));

    if (!existing) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    // Update client details if provided
    if (name || phone || email || companyName || gstin) {
      await db
        .update(clients)
        .set({
          name: name || undefined,
          phone: phone || undefined,
          email: email !== undefined ? email : undefined,
          companyName: companyName !== undefined ? companyName : undefined,
          gstin: gstin !== undefined ? gstin : undefined,
        })
        .where(eq(clients.id, existing.clientId));
    }

    // Update enquiry fields
    await db
      .update(enquiries)
      .set({
        workType: workType || undefined,
        siteLocation: siteLocation || undefined,
        description: description !== undefined ? description : undefined,
        estimatedBudget: estimatedBudget !== undefined ? Number(estimatedBudget) : undefined,
        status: status || undefined,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(enquiries.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Edit enquiry error:", error);
    return NextResponse.json({ error: "Failed to edit enquiry" }, { status: 500 });
  }
}

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
    // Unlink any quotation referencing this enquiry
    await db
      .update(quotations)
      .set({ enquiryId: null })
      .where(eq(quotations.enquiryId, id));

    // Delete followups
    await db.delete(followups).where(eq(followups.enquiryId, id));

    // Delete enquiry
    await db.delete(enquiries).where(eq(enquiries.id, id));

    return NextResponse.json({ success: true, message: "Enquiry deleted successfully" });
  } catch (error) {
    console.error("Delete enquiry error:", error);
    return NextResponse.json({ error: "Failed to delete enquiry" }, { status: 500 });
  }
}
