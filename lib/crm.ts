import { db } from "./db";
import { clients, enquiries } from "./db/schema";
import { eq } from "drizzle-orm";
import type { Enquiry } from "./validation";

export async function saveEnquiryToCRM(d: Enquiry) {
  try {
    const cleanPhone = d.phone.trim();
    // 1. Check if client already exists with this phone
    let [client] = await db.select().from(clients).where(eq(clients.phone, cleanPhone));

    if (!client) {
      const clientId = "cli_" + crypto.randomUUID().slice(0, 8);
      await db.insert(clients).values({
        id: clientId,
        name: d.name.trim(),
        phone: cleanPhone,
        email: d.email ? d.email.trim().toLowerCase() : null,
        companyName: null,
      });

      client = {
        id: clientId,
        name: d.name.trim(),
        phone: cleanPhone,
        email: d.email ? d.email.trim().toLowerCase() : null,
        companyName: null,
        gstin: null,
        billingAddress: null,
        siteAddress: null,
        createdAt: new Date().toISOString(),
      };
    }

    // 2. Insert Enquiry linked to this client
    const enquiryId = "enq_" + crypto.randomUUID().slice(0, 8);
    await db.insert(enquiries).values({
      id: enquiryId,
      clientId: client.id,
      workType: d.workType,
      siteLocation: "Public Website Form",
      description: d.message || "Enquiry submitted via website form.",
      status: "NEW",
    });

    console.log(`[CRM] Auto-saved website enquiry ${enquiryId} for client ${client.name}`);
    return enquiryId;
  } catch (err) {
    console.error("[CRM Error] Failed to auto-save enquiry to database:", err);
    return null;
  }
}

