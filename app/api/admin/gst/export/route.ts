import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { salesInvoices, purchaseBills, clients, vendors, gstMonthlyReconciliations } from "@/lib/db/schema";
import { getAuthenticatedUser } from "@/lib/auth";
import { eq, and, gte, lte } from "drizzle-orm";

export async function GET(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user || user.role === "SITE_ENGINEER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const month = parseInt(url.searchParams.get("month") || String(new Date().getMonth() + 1));
  const year = parseInt(url.searchParams.get("year") || String(new Date().getFullYear()));

  const padMonth = String(month).padStart(2, "0");
  const startDate = `${year}-${padMonth}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${padMonth}-${String(lastDay).padStart(2, "0")}`;

  const sales = await db
    .select({
      invoiceNumber: salesInvoices.invoiceNumber,
      invoiceDate: salesInvoices.invoiceDate,
      taxableValue: salesInvoices.taxableValue,
      cgstAmount: salesInvoices.cgstAmount,
      sgstAmount: salesInvoices.sgstAmount,
      igstAmount: salesInvoices.igstAmount,
      totalInvoiceAmount: salesInvoices.totalInvoiceAmount,
      clientName: clients.name,
      companyName: clients.companyName,
      clientGstin: clients.gstin,
    })
    .from(salesInvoices)
    .innerJoin(clients, eq(salesInvoices.clientId, clients.id))
    .where(and(gte(salesInvoices.invoiceDate, startDate), lte(salesInvoices.invoiceDate, endDate)));

  const purchases = await db
    .select({
      vendorInvoiceNumber: purchaseBills.vendorInvoiceNumber,
      billDate: purchaseBills.billDate,
      category: purchaseBills.category,
      taxableValue: purchaseBills.taxableValue,
      cgstAmount: purchaseBills.cgstAmount,
      sgstAmount: purchaseBills.sgstAmount,
      igstAmount: purchaseBills.igstAmount,
      totalBillAmount: purchaseBills.totalBillAmount,
      itcEligibility: purchaseBills.itcEligibility,
      vendorName: vendors.name,
      vendorGstin: vendors.gstin,
    })
    .from(purchaseBills)
    .innerJoin(vendors, eq(purchaseBills.vendorId, vendors.id))
    .where(and(gte(purchaseBills.billDate, startDate), lte(purchaseBills.billDate, endDate)));

  // Generate CSV
  const lines: string[] = [];

  lines.push(`KANDHAN GROUPS — MONTHLY GST FILING PACKET (${padMonth}/${year})`);
  lines.push(`GSTIN: 33AAAAA0000A1Z5, Generated On: ${new Date().toISOString()}`);
  lines.push("");

  // Section 1: Sales Invoices (GSTR-1 Outward Supplies)
  lines.push("--- SECTION 1: SALES INVOICES (GSTR-1 OUTWARD SUPPLIES) ---");
  lines.push("Invoice No,Date,Client Name,Client GSTIN,SAC Code,Taxable Value (INR),CGST 9% (INR),SGST 9% (INR),IGST 18% (INR),Total Invoice (INR)");
  for (const s of sales) {
    lines.push(
      `"${s.invoiceNumber}","${s.invoiceDate}","${s.clientName} (${s.companyName || ""})","${s.clientGstin || "UNREGISTERED"}","9954",${s.taxableValue},${s.cgstAmount},${s.sgstAmount},${s.igstAmount},${s.totalInvoiceAmount}`
    );
  }
  lines.push("");

  // Section 2: Purchase Bills (GSTR-3B Table 4 Inward Supplies & ITC)
  lines.push("--- SECTION 2: PURCHASE BILLS (GSTR-3B TABLE 4 ELIGIBLE ITC) ---");
  lines.push("Supplier Name,Supplier GSTIN,Bill No,Bill Date,Material Category,Taxable Value (INR),CGST (INR),SGST (INR),IGST (INR),Total Bill (INR),ITC Eligibility");
  for (const p of purchases) {
    lines.push(
      `"${p.vendorName}","${p.vendorGstin || "UNREGISTERED"}","${p.vendorInvoiceNumber}","${p.billDate}","${p.category}",${p.taxableValue},${p.cgstAmount},${p.sgstAmount},${p.igstAmount},${p.totalBillAmount},"${p.itcEligibility}"`
    );
  }
  lines.push("");

  // Section 3: Summary Totals
  const totalOutwardTaxable = sales.reduce((a, s) => a + s.taxableValue, 0);
  const totalOutputGst = sales.reduce((a, s) => a + s.cgstAmount + s.sgstAmount + s.igstAmount, 0);
  const totalInwardTaxable = purchases.reduce((a, p) => a + p.taxableValue, 0);
  const totalEligibleItc = purchases
    .filter((p) => p.itcEligibility === "ELIGIBLE")
    .reduce((a, p) => a + p.cgstAmount + p.sgstAmount + p.igstAmount, 0);
  const netGstPayable = Math.max(0, totalOutputGst - totalEligibleItc);

  lines.push("--- SECTION 3: MONTHLY GST RECONCILIATION SUMMARY ---");
  lines.push(`Total Outward Taxable Value (Sales),INR ${totalOutwardTaxable.toFixed(2)}`);
  lines.push(`Total Output GST Payable,INR ${totalOutputGst.toFixed(2)}`);
  lines.push(`Total Inward Taxable Value (Purchases),INR ${totalInwardTaxable.toFixed(2)}`);
  lines.push(`Total Eligible Input Tax Credit (ITC),INR ${totalEligibleItc.toFixed(2)}`);
  lines.push(`NET GST TAX LIABILITY TO PAY,INR ${netGstPayable.toFixed(2)}`);
  lines.push(
    totalOutputGst === 0 && totalEligibleItc === 0
      ? "STATUS: NIL RETURN MONTH (No outward or inward taxable supplies)"
      : "STATUS: TAXABLE TRANSACTIONS PROCESSED"
  );

  const csvContent = lines.join("\n");

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="Kandhan_Groups_GST_${year}_${padMonth}.csv"`,
    },
  });
}

