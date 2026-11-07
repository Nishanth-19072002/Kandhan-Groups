import { getAuthenticatedUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  enquiries,
  quotations,
  orderConfirmations,
  salesInvoices,
  purchaseBills,
  clients,
} from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import Link from "next/link";
import {
  Users,
  Contact,
  FileSpreadsheet,
  FileCheck2,
  Receipt,
  ShoppingCart,
  Calculator,
  ArrowUpRight,
  Plus,
  Sparkles,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/admin/login");

  // Fetch quick counts from DB
  const [enquiriesCount] = await db.select({ count: sql<number>`count(*)` }).from(enquiries);
  const [activeProjectsCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(orderConfirmations)
    .where(eq(orderConfirmations.status, "ACTIVE"));

  const [quotationsCount] = await db.select({ count: sql<number>`count(*)` }).from(quotations);
  const [confirmedQuotesCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(quotations)
    .where(eq(quotations.status, "CONFIRMED"));

  // Financial aggregates (only for Super Admin & Accountant)
  const isFinanceUser = user.role === "SUPER_ADMIN" || user.role === "ACCOUNTANT";

  const [salesTotals] = isFinanceUser
    ? await db
        .select({
          totalSales: sql<number>`coalesce(sum(${salesInvoices.totalInvoiceAmount}), 0)`,
          outputGst: sql<number>`coalesce(sum(${salesInvoices.cgstAmount} + ${salesInvoices.sgstAmount} + ${salesInvoices.igstAmount}), 0)`,
        })
        .from(salesInvoices)
    : [{ totalSales: 0, outputGst: 0 }];

  const [purchaseTotals] = isFinanceUser
    ? await db
        .select({
          totalPurchases: sql<number>`coalesce(sum(${purchaseBills.totalBillAmount}), 0)`,
          inputItc: sql<number>`coalesce(sum(${purchaseBills.cgstAmount} + ${purchaseBills.sgstAmount} + ${purchaseBills.igstAmount}), 0)`,
        })
        .from(purchaseBills)
        .where(eq(purchaseBills.itcEligibility, "ELIGIBLE"))
    : [{ totalPurchases: 0, inputItc: 0 }];

  const netGstLiability = Math.max(0, (salesTotals?.outputGst || 0) - (purchaseTotals?.inputItc || 0));

  // Recent 5 Enquiries
  const recentEnquiries = await db
    .select({
      id: enquiries.id,
      workType: enquiries.workType,
      siteLocation: enquiries.siteLocation,
      status: enquiries.status,
      createdAt: enquiries.createdAt,
      clientName: clients.name,
      clientPhone: clients.phone,
    })
    .from(enquiries)
    .innerJoin(clients, eq(enquiries.clientId, clients.id))
    .orderBy(desc(enquiries.createdAt))
    .limit(5);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Executive Navy & Gold Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0B192C] via-[#0f2744] to-[#0B192C] text-white p-6 md:p-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Kandhan Groups Digital Management
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {user.name}
            </h1>
            <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-xl">
              Civil Construction, Industrial Infrastructure & PMC Suite. Manage itemized quotations,
              track active site work orders, verify supplier bills, and monitor GST reconciliation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/quotations"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-amber-500/25"
            >
              <Plus className="w-4 h-4" />
              New Quotation
            </Link>
            <Link
              href="/admin/enquiries"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-semibold text-xs transition border border-slate-700"
            >
              <Users className="w-4 h-4" />
              View Leads
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid (Crisp White Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Enquiries Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Client Enquiries</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900">{enquiriesCount?.count || 0}</div>
            <p className="text-xs text-slate-500 mt-1">
              Active prospective client leads
            </p>
          </div>
          <Link
            href="/admin/enquiries"
            className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Manage Pipeline <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Quotations Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Quotations</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900">{quotationsCount?.count || 0}</div>
            <p className="text-xs text-amber-600 font-bold mt-1">
              {confirmedQuotesCount?.count || 0} Confirmed by Clients
            </p>
          </div>
          <Link
            href="/admin/quotations"
            className="mt-4 text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            Quotation Engine <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Work Orders Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Active Projects</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900">
              {activeProjectsCount?.count || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">Work orders under active site work</p>
          </div>
          <Link
            href="/admin/orders"
            className="mt-4 text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            Work Orders <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Financial / GST Card */}
        {isFinanceUser ? (
          <div className="p-5 rounded-2xl bg-white border border-amber-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                GST Net Liability
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Calculator className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-black text-amber-600">
                ₹{netGstLiability.toLocaleString("en-IN")}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Output: ₹{Math.round(salesTotals.outputGst).toLocaleString("en-IN")} | ITC: ₹
                {Math.round(purchaseTotals.inputItc).toLocaleString("en-IN")}
              </p>
            </div>
            <Link
              href="/admin/gst"
              className="mt-4 text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              GST Filing Dashboard <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Site Purchases</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm font-bold text-slate-900">Material Bills</div>
              <p className="text-xs text-slate-500 mt-1">Upload supplier receipts on-site</p>
            </div>
            <Link
              href="/admin/purchases"
              className="mt-4 text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              Upload Material Bill <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Quick Action Hub */}
      <div>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Quick Operational Shortcuts
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <Link
            href="/admin/clients"
            className="p-4 rounded-xl bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-amber-200 shadow-xs transition flex flex-col items-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 group-hover:bg-amber-500 group-hover:text-slate-950 transition flex items-center justify-center mb-2 font-bold shadow-xs">
              <Contact className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Clients Directory</span>
          </Link>

          <Link
            href="/admin/enquiries"
            className="p-4 rounded-xl bg-white hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 shadow-xs transition flex flex-col items-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition flex items-center justify-center mb-2 font-bold shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">New Client / Lead</span>
          </Link>

          <Link
            href="/admin/quotations"
            className="p-4 rounded-xl bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-amber-200 shadow-xs transition flex flex-col items-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-slate-950 transition flex items-center justify-center mb-2 font-bold shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Quotation Maker</span>
          </Link>

          <Link
            href="/admin/orders"
            className="p-4 rounded-xl bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-200 shadow-xs transition flex flex-col items-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition flex items-center justify-center mb-2 font-bold shadow-xs">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Work Orders</span>
          </Link>

          {isFinanceUser && (
            <Link
              href="/admin/invoices"
              className="p-4 rounded-xl bg-white hover:bg-cyan-50/50 border border-slate-200 hover:border-cyan-200 shadow-xs transition flex flex-col items-center text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition flex items-center justify-center mb-2 font-bold shadow-xs">
                <Receipt className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Tax Invoices</span>
            </Link>
          )}

          <Link
            href="/admin/purchases"
            className="p-4 rounded-xl bg-white hover:bg-purple-50/50 border border-slate-200 hover:border-purple-200 shadow-xs transition flex flex-col items-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition flex items-center justify-center mb-2 font-bold shadow-xs">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Site Bill Upload</span>
          </Link>

          {isFinanceUser && (
            <Link
              href="/admin/gst"
              className="p-4 rounded-xl bg-white hover:bg-rose-50/50 border border-slate-200 hover:border-rose-200 shadow-xs transition flex flex-col items-center text-center group"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition flex items-center justify-center mb-2 font-bold shadow-xs">
                <Calculator className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">GST Filing & CA</span>
            </Link>
          )}
        </div>
      </div>

      {/* Recent Enquiries Table (Crisp White Card) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Recent Enquiries & Site Requests</h2>
            <p className="text-xs text-slate-500">Leads captured from website and direct phone calls</p>
          </div>
          <Link
            href="/admin/enquiries"
            className="text-xs font-bold text-amber-600 hover:text-amber-700"
          >
            View All ({enquiriesCount?.count || 0}) →
          </Link>
        </div>

        {recentEnquiries.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No client enquiries recorded yet. Click &quot;New Client / Lead&quot; to add your first enquiry.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3 font-bold">Client Name</th>
                  <th className="py-3 px-3 font-bold">Work Type</th>
                  <th className="py-3 px-3 font-bold">Location</th>
                  <th className="py-3 px-3 font-bold">Status</th>
                  <th className="py-3 px-3 font-bold">Created</th>
                  <th className="py-3 px-3 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentEnquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-3 font-bold text-slate-900">
                      <div>{enq.clientName}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{enq.clientPhone}</div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-700">{enq.workType}</td>
                    <td className="py-3.5 px-3 text-slate-500">{enq.siteLocation}</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {enq.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-500">
                      {enq.createdAt ? new Date(enq.createdAt).toLocaleDateString() : "Recent"}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <Link
                        href={`/admin/quotations?enquiryId=${enq.id}`}
                        className="text-amber-600 hover:text-amber-700 font-bold text-[11px]"
                      >
                        Create Quote →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
