import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  clients,
  enquiries,
  followups,
  quotations,
  quotationRevisions,
  quotationItems,
  orderConfirmations,
  salesInvoices,
  invoicePayments,
  vendors,
  purchaseBills,
  gstMonthlyReconciliations,
  companySettings,
} from "@/lib/db/schema";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const [
      allClients,
      allEnquiries,
      allFollowups,
      allQuotations,
      allRevisions,
      allItems,
      allOrders,
      allInvoices,
      allPayments,
      allVendors,
      allPurchases,
      allGst,
      company,
    ] = await Promise.all([
      db.select().from(clients),
      db.select().from(enquiries),
      db.select().from(followups),
      db.select().from(quotations),
      db.select().from(quotationRevisions),
      db.select().from(quotationItems),
      db.select().from(orderConfirmations),
      db.select().from(salesInvoices),
      db.select().from(invoicePayments),
      db.select().from(vendors),
      db.select().from(purchaseBills),
      db.select().from(gstMonthlyReconciliations),
      db.select().from(companySettings),
    ]);

    const fullDump = {
      exportedAt: new Date().toISOString(),
      companyProfile: company[0] || null,
      clients: allClients,
      enquiries: allEnquiries,
      followups: allFollowups,
      quotations: allQuotations,
      quotationRevisions: allRevisions,
      quotationItems: allItems,
      workOrders: allOrders,
      salesInvoices: allInvoices,
      payments: allPayments,
      vendors: allVendors,
      purchaseBills: allPurchases,
      gstReconciliations: allGst,
    };

    const today = new Date().toISOString().split("T")[0];

    return new NextResponse(JSON.stringify(fullDump, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="kandhan_groups_full_dump_${today}.json"`,
      },
    });
  } catch (error) {
    console.error("Export dump error:", error);
    return NextResponse.json({ error: "Failed to export data dump" }, { status: 500 });
  }
}

