import { db } from "./index";
import { users, companySettings, vendors } from "./schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Starting Kandhan Groups CRM database seed...");

  // 1. Company Profile Settings
  const existingCompany = await db.select().from(companySettings).where(eq(companySettings.id, "primary"));
  if (existingCompany.length === 0) {
    await db.insert(companySettings).values({
      id: "primary",
      companyName: "Kandhan Groups",
      phone: "+91 94883 44434",
      email: "kandhangroups@gmail.com",
      address: "Industrial Infrastructure, PMC & Civil Construction, Tamil Nadu, India",
      gstin: "33AAAAA0000A1Z5",
      pan: "AAAAA0000A",
      bankName: "State Bank of India",
      accountNumber: "123456789012",
      ifscCode: "SBIN0001234",
      branch: "Main Branch",
      defaultTerms:
        "1. 50% advance upon Order Confirmation.\n2. 40% running payment based on stage completion.\n3. 10% balance upon final site handover.\n4. Standard 18% GST applicable on all taxable civil and finishing works.\n5. Rates are valid for 30 days from quote date.",
    });
    console.log("✓ Company Profile seeded");
  }

  // 2. Default Users
  const adminPasswordHash = await bcrypt.hash("Admin@123456", 10);
  const engineerPasswordHash = await bcrypt.hash("Engineer@123", 10);
  const accountantPasswordHash = await bcrypt.hash("Accounts@123", 10);

  const existingAdmin = await db.select().from(users).where(eq(users.email, "admin@kandhangroups.com"));
  if (existingAdmin.length === 0) {
    await db.insert(users).values([
      {
        id: "usr_admin_01",
        name: "Nishanth (Founder & MD)",
        email: "admin@kandhangroups.com",
        passwordHash: adminPasswordHash,
        phone: "+91 94883 44434",
        role: "SUPER_ADMIN",
        isActive: 1,
      },
      {
        id: "usr_eng_01",
        name: "Site Supervisor",
        email: "engineer@kandhangroups.com",
        passwordHash: engineerPasswordHash,
        phone: "+91 98765 43210",
        role: "SITE_ENGINEER",
        isActive: 1,
      },
      {
        id: "usr_acc_01",
        name: "Accounts Desk",
        email: "accounts@kandhangroups.com",
        passwordHash: accountantPasswordHash,
        phone: "+91 91234 56789",
        role: "ACCOUNTANT",
        isActive: 1,
      },
    ]);
    console.log("✓ Default RBAC users seeded (SUPER_ADMIN, SITE_ENGINEER, ACCOUNTANT)");
  }

  // 3. Default Material Suppliers / Vendors
  const existingVendors = await db.select().from(vendors);
  if (existingVendors.length === 0) {
    await db.insert(vendors).values([
      {
        id: "ven_01",
        name: "Ultratech Cement Agency",
        contactPerson: "R. Suresh",
        phone: "+91 98401 23456",
        email: "suresh.cement@gmail.com",
        gstin: "33ABCDE1234F1Z1",
        category: "Cement & Aggregates",
        address: "Industrial Estate, SIPCOT",
      },
      {
        id: "ven_02",
        name: "TMT Steel Suppliers",
        contactPerson: "K. Mohan",
        phone: "+91 98402 34567",
        email: "tmt.steel@gmail.com",
        gstin: "33FGHIJ5678K1Z2",
        category: "Structural & Reinforcement Steel",
        address: "Ring Road bypass",
      },
      {
        id: "ven_03",
        name: "Supreme Electrical & Hardware",
        contactPerson: "M. Dinesh",
        phone: "+91 98403 45678",
        email: "supreme.hardware@gmail.com",
        gstin: "33KLMNO9012P1Z3",
        category: "Electrical & Plumbing",
        address: "Commercial Bazaar",
      },
    ]);
    console.log("✓ Sample verified vendors seeded");
  }

  console.log("🎉 Database seed completed successfully!");
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});

