"use client";

import { useEffect, useState } from "react";
import {
  Calculator,
  Download,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  ShoppingCart,
  Sliders,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
} from "lucide-react";

export default function GstReconciliationPage() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"summary" | "sales" | "purchases">("summary");

  // Adjustments Drawer
  const [adjDrawerOpen, setAdjDrawerOpen] = useState(false);
  const [adjCgst, setAdjCgst] = useState(0);
  const [adjSgst, setAdjSgst] = useState(0);
  const [adjIgst, setAdjIgst] = useState(0);
  const [adjReason, setAdjReason] = useState("");
  const [savingAdj, setSavingAdj] = useState(false);

  useEffect(() => {
    fetchGstData();
  }, [selectedMonth, selectedYear]);

  async function fetchGstData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/gst?month=${selectedMonth}&year=${selectedYear}`);
      const json = await res.json();
      if (res.ok) {
        setData(json);
        setAdjCgst(json.summary.adjCgst || 0);
        setAdjSgst(json.summary.adjSgst || 0);
        setAdjIgst(json.summary.adjIgst || 0);
        setAdjReason(json.summary.adjReason || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveAdjustments(e: React.FormEvent) {
    e.preventDefault();
    setSavingAdj(true);
    try {
      const res = await fetch("/api/admin/gst", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear,
          adjCgst,
          adjSgst,
          adjIgst,
          adjustmentReason: adjReason,
        }),
      });
      if (res.ok) {
        setAdjDrawerOpen(false);
        fetchGstData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingAdj(false);
    }
  }

  function downloadCaPacket() {
    window.open(`/api/admin/gst/export?month=${selectedMonth}&year=${selectedYear}`, "_blank");
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Month Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Calculator className="w-6 h-6 text-amber-400" />
            Monthly GST Filing & Reconciliation Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Auto-reconciles Output GST (Sales) vs. Input Tax Credit (Purchases), flags Nil return months, and exports 1-click Chartered Accountant packets.
          </p>
        </div>

        {/* Date Selector & CA Export Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 shadow-xs p-1.5 rounded-xl text-xs">
            <Calendar className="w-4 h-4 text-amber-500 ml-1.5" />
            <select suppressHydrationWarning
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer pr-1"
            >
              {monthNames.map((m, idx) => (
                <option key={m} value={idx + 1} className="bg-white text-slate-900">
                  {m}
                </option>
              ))}
            </select>
            <select suppressHydrationWarning
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer border-l border-slate-200 pl-2"
            >
              {[2025, 2026, 2027].map((y) => (
                <option key={y} value={y} className="bg-white text-slate-900">
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button suppressHydrationWarning
            onClick={downloadCaPacket}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" />
            Export CA Packet (.csv)
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-24 text-slate-500 text-xs">Computing GST liability & ITC credits...</div>
      ) : !data ? (
        <div className="text-center py-20 text-rose-600 text-xs font-semibold">Failed to calculate GST reconciliation.</div>
      ) : (
        <div className="space-y-6">
          {/* Nil Return Alert Banner */}
          {data.isNilReturn && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center font-bold">
                  🟢
                </div>
                <div>
                  <div className="font-bold text-emerald-900 text-sm">
                    NIL Return Month Detected ({monthNames[selectedMonth - 1]} {selectedYear})
                  </div>
                  <div className="text-emerald-700 text-[11px]">
                    No outward sales invoices or inward material purchases recorded this month. Ready for instant Nil filing on GST Portal.
                  </div>
                </div>
              </div>

              <button suppressHydrationWarning
                onClick={downloadCaPacket}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Download Nil Statement
              </button>
            </div>
          )}

          {/* 3 Core Metric Cards: Output Tax, Input Credit, Net Liability */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Outward Tax (Sales) */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span className="font-bold uppercase tracking-wider text-cyan-800">Outward GST (Sales GSTR-1)</span>
                <Receipt className="w-4 h-4 text-cyan-600" />
              </div>
              <div className="my-3">
                <div className="text-2xl font-black text-slate-900">
                  ₹{Math.round(data.summary.totalOutput).toLocaleString("en-IN")}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Taxable Turnover: ₹{Math.round(data.summary.totalOutwardTaxable).toLocaleString("en-IN")}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex justify-between font-medium">
                <span>CGST: ₹{Math.round(data.summary.outputCgst).toLocaleString("en-IN")}</span>
                <span>SGST: ₹{Math.round(data.summary.outputSgst).toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* 2. Inward ITC (Purchases) */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span className="font-bold uppercase tracking-wider text-purple-800">Input Tax Credit (ITC GSTR-3B)</span>
                <ShoppingCart className="w-4 h-4 text-purple-600" />
              </div>
              <div className="my-3">
                <div className="text-2xl font-black text-purple-700">
                  ₹{Math.round(data.summary.totalInput).toLocaleString("en-IN")}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Material Purchases: ₹{Math.round(data.summary.totalInwardTaxable).toLocaleString("en-IN")}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex justify-between font-medium">
                <span>Eligible CGST: ₹{Math.round(data.summary.inputEligibleCgst).toLocaleString("en-IN")}</span>
                <span>Eligible SGST: ₹{Math.round(data.summary.inputEligibleSgst).toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* 3. Net Tax Liability */}
            <div className="p-5 rounded-2xl bg-[#0B192C] border border-amber-500/50 flex flex-col justify-between shadow-md">
              <div className="flex items-center justify-between text-xs text-amber-400">
                <span className="font-bold uppercase tracking-wider">Net GST Tax Liability</span>
                <Calculator className="w-4 h-4 text-amber-400" />
              </div>
              <div className="my-3">
                <div className="text-3xl font-black text-amber-400">
                  ₹{Math.round(data.summary.totalNetPayable).toLocaleString("en-IN")}
                </div>
                {data.summary.itcCarriedForward > 0 && (
                  <div className="text-[11px] text-emerald-300 font-semibold mt-1">
                    ITC Credit Carried Forward: ₹{Math.round(data.summary.itcCarriedForward).toLocaleString("en-IN")}
                  </div>
                )}
                {data.summary.totalNetPayable > 0 && (
                  <div className="text-[11px] text-slate-300 mt-1">
                    Net CGST: ₹{Math.round(data.summary.netPayableCgst).toLocaleString("en-IN")} | Net SGST: ₹{Math.round(data.summary.netPayableSgst).toLocaleString("en-IN")}
                  </div>
                )}
              </div>
              <div className="pt-2 border-t border-slate-700 flex items-center justify-between text-[11px]">
                <button suppressHydrationWarning
                  onClick={() => setAdjDrawerOpen(true)}
                  className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  Manual Adjustments ({data.summary.adjCgst + data.summary.adjSgst !== 0 ? "Active" : "None"})
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation: Detailed Tables */}
          <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1.5 max-w-md">
            <button suppressHydrationWarning
              onClick={() => setActiveTab("summary")}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === "summary"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Filing Breakdown
            </button>
            <button suppressHydrationWarning
              onClick={() => setActiveTab("sales")}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === "sales"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Sales GSTR-1 ({data.sales.length})
            </button>
            <button suppressHydrationWarning
              onClick={() => setActiveTab("purchases")}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === "purchases"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Purchases ITC ({data.purchases.length})
            </button>
          </div>

          {/* Tab Content: Filing Breakdown */}
          {activeTab === "summary" && (
            <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-extrabold text-slate-900">GSTR-3B Tax Computation Summary Table</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-xl">
                  <thead className="bg-slate-100/75 text-slate-600 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 font-bold">Tax Head</th>
                      <th className="py-3 px-4 font-bold text-right">Output GST (Sales)</th>
                      <th className="py-3 px-4 font-bold text-right">Eligible ITC (Purchases)</th>
                      <th className="py-3 px-4 font-bold text-right">Manual Adjustments</th>
                      <th className="py-3 px-4 font-bold text-right text-amber-400">Net Tax Payable (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white font-mono">
                    <tr>
                      <td className="py-3 px-4 font-sans font-semibold text-slate-800">Central Tax (CGST)</td>
                      <td className="py-3 px-4 text-right">₹{Math.round(data.summary.outputCgst).toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 text-right text-purple-400">₹{Math.round(data.summary.inputEligibleCgst).toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 text-right text-slate-400">₹{Math.round(data.summary.adjCgst).toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 text-right font-bold text-amber-400">₹{Math.round(data.summary.netPayableCgst).toLocaleString("en-IN")}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-sans font-semibold text-slate-800">State / UT Tax (SGST)</td>
                      <td className="py-3 px-4 text-right">₹{Math.round(data.summary.outputSgst).toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 text-right text-purple-400">₹{Math.round(data.summary.inputEligibleSgst).toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 text-right text-slate-400">₹{Math.round(data.summary.adjSgst).toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 text-right font-bold text-amber-400">₹{Math.round(data.summary.netPayableSgst).toLocaleString("en-IN")}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-sans font-semibold text-slate-800">Integrated Tax (IGST)</td>
                      <td className="py-3 px-4 text-right">₹{Math.round(data.summary.outputIgst).toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 text-right text-purple-400">₹{Math.round(data.summary.inputEligibleIgst).toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 text-right text-slate-400">₹{Math.round(data.summary.adjIgst).toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 text-right font-bold text-amber-400">₹{Math.round(data.summary.netPayableIgst).toLocaleString("en-IN")}</td>
                    </tr>
                    <tr className="bg-[#0B192C] font-bold border-t-2 border-slate-900 text-white">
                      <td className="py-3.5 px-4 font-sans text-sm text-white">TOTALS:</td>
                      <td className="py-3.5 px-4 text-right text-white">₹{Math.round(data.summary.totalOutput).toLocaleString("en-IN")}</td>
                      <td className="py-3.5 px-4 text-right text-purple-300">₹{Math.round(data.summary.totalInput).toLocaleString("en-IN")}</td>
                      <td className="py-3.5 px-4 text-right text-slate-300">₹{Math.round(data.summary.adjCgst + data.summary.adjSgst + data.summary.adjIgst).toLocaleString("en-IN")}</td>
                      <td className="py-3.5 px-4 text-right text-sm text-amber-400 font-black">₹{Math.round(data.summary.totalNetPayable).toLocaleString("en-IN")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab Content: Sales GSTR-1 */}
          {activeTab === "sales" && (
            <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-6">
              <h2 className="text-base font-extrabold text-slate-900 mb-4">Outward Taxable Supplies (Sales Invoices)</h2>
              {data.sales.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">No sales invoices issued in this month.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold text-[10px] bg-slate-50/80">
                      <tr>
                        <th className="py-3 px-3 font-bold">Invoice No</th>
                        <th className="py-3 px-3 font-bold">Date</th>
                        <th className="py-3 px-3 font-bold">Client Name</th>
                        <th className="py-3 px-3 font-bold">Client GSTIN</th>
                        <th className="py-3 px-3 font-bold text-right">Taxable (₹)</th>
                        <th className="py-3 px-3 font-bold text-right">GST (₹)</th>
                        <th className="py-3 px-3 font-bold text-right">Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.sales.map((s: any) => (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-mono font-bold text-cyan-700">{s.invoiceNumber}</td>
                          <td className="py-3 px-3 text-slate-600">{s.invoiceDate}</td>
                          <td className="py-3 px-3 text-slate-900 font-bold">{s.clientName}</td>
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-600">{s.clientGstin || "Unregistered (B2C)"}</td>
                          <td className="py-3 px-3 text-right text-slate-700">₹{s.taxableValue.toLocaleString("en-IN")}</td>
                          <td className="py-3 px-3 text-right text-amber-600 font-bold">₹{Math.round(s.cgstAmount + s.sgstAmount + s.igstAmount).toLocaleString("en-IN")}</td>
                          <td className="py-3 px-3 text-right font-extrabold text-slate-900">₹{s.totalInvoiceAmount.toLocaleString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Purchases ITC */}
          {activeTab === "purchases" && (
            <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-6">
              <h2 className="text-base font-extrabold text-slate-900 mb-4">Inward Supplies & Input Tax Credit (ITC)</h2>
              {data.purchases.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">No purchase bills uploaded for this month.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold text-[10px] bg-slate-50/80">
                      <tr>
                        <th className="py-3 px-3 font-bold">Supplier Name</th>
                        <th className="py-3 px-3 font-bold">Supplier GSTIN</th>
                        <th className="py-3 px-3 font-bold">Bill No & Date</th>
                        <th className="py-3 px-3 font-bold">Material</th>
                        <th className="py-3 px-3 font-bold text-right">Taxable (₹)</th>
                        <th className="py-3 px-3 font-bold text-right">Eligible ITC (₹)</th>
                        <th className="py-3 px-3 font-bold text-right">Total Bill (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.purchases.map((p: any) => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-extrabold text-slate-900">{p.vendorName}</td>
                          <td className="py-3 px-3 font-mono text-[11px] text-emerald-800 font-semibold">{p.vendorGstin || "Unregistered"}</td>
                          <td className="py-3 px-3 text-slate-600 font-mono">#{p.vendorInvoiceNumber} • {p.billDate}</td>
                          <td className="py-3 px-3 text-slate-700">{p.category}</td>
                          <td className="py-3 px-3 text-right text-slate-700">₹{p.taxableValue.toLocaleString("en-IN")}</td>
                          <td className="py-3 px-3 text-right font-bold text-purple-700">₹{Math.round(p.cgstAmount + p.sgstAmount + p.igstAmount).toLocaleString("en-IN")}</td>
                          <td className="py-3 px-3 text-right font-extrabold text-slate-900">₹{p.totalBillAmount.toLocaleString("en-IN")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Manual Adjustments Modal */}
      {adjDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6">
            <h2 className="text-base font-extrabold text-slate-900 mb-2 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-500" />
              Manual GST Adjustments
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Add non-bill adjustments, reverse charge liability, or round-off differences before auditor export.
            </p>

            <form onSubmit={handleSaveAdjustments} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-semibold mb-1">CGST Adjustment (₹)</label>
                  <input suppressHydrationWarning
                    type="number"
                    value={adjCgst}
                    onChange={(e) => setAdjCgst(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-semibold mb-1">SGST Adjustment (₹)</label>
                  <input suppressHydrationWarning
                    type="number"
                    value={adjSgst}
                    onChange={(e) => setAdjSgst(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 font-semibold mb-1">Reason for Adjustment</label>
                <textarea
                  rows={3}
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  placeholder="e.g. Reverse charge liability on transport contractor, round-off differences..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button suppressHydrationWarning
                  type="button"
                  onClick={() => setAdjDrawerOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button suppressHydrationWarning
                  type="submit"
                  disabled={savingAdj}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  {savingAdj ? "Saving..." : "Apply Adjustments"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

