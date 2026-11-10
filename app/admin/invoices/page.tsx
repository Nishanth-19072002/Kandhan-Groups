"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import {
  Receipt,
  Plus,
  Search,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  CreditCard,
  Building,
  Calendar,
  FileCheck2,
  Edit3,
  Trash2,
  Eye,
  RefreshCw,
  AlertTriangle,
  FileText,
  Landmark,
  ShieldCheck,
} from "lucide-react";

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  invoiceType: string;
  invoiceDate: string;
  dueDate: string | null;
  taxableValue: number;
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalInvoiceAmount: number;
  amountPaid: number;
  balanceAmount: number;
  paymentStatus: string;
  notes: string | null;
  createdAt: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  companyName: string | null;
  gstin: string | null;
  orderNumber: string | null;
}

export default function InvoicesPage() {
  const searchParams = useSearchParams();
  const preselectedOrderId = searchParams?.get("orderId") || "";
  const preselectedType = (searchParams?.get("type") as string) || "";

  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(preselectedOrderId);
  const [invoiceType, setInvoiceType] = useState<"PROFORMA" | "TAX_INVOICE">(
    preselectedType === "PROFORMA" ? "PROFORMA" : "TAX_INVOICE"
  );
  const [taxableValue, setTaxableValue] = useState("");
  const [gstRate, setGstRate] = useState(18);
  const [isInterState, setIsInterState] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  // Record Payment Modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<InvoiceItem | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("NEFT_RTGS");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentNotes, setPaymentNotes] = useState("");
  const [recordingPayment, setRecordingPayment] = useState(false);

  // Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editInvoiceNumber, setEditInvoiceNumber] = useState("");
  const [editTaxableValue, setEditTaxableValue] = useState("");
  const [editGstRate, setEditGstRate] = useState(18);
  const [editInvoiceDate, setEditInvoiceDate] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editPaymentStatus, setEditPaymentStatus] = useState("UNPAID");
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<InvoiceItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // View / Print Modal
  const [printInvoice, setPrintInvoice] = useState<InvoiceItem | null>(null);

  useEffect(() => {
    fetchInvoices();
    fetchClientsAndOrders();
  }, []);

  // Handle URL Params: auto open modal if directed with orderId or type
  useEffect(() => {
    if (preselectedOrderId || preselectedType) {
      if (preselectedType === "PROFORMA") {
        setInvoiceType("PROFORMA");
      } else if (preselectedType === "TAX_INVOICE") {
        setInvoiceType("TAX_INVOICE");
      }
      setSelectedOrderId(preselectedOrderId);
      setCreateModalOpen(true);
    }
  }, [preselectedOrderId, preselectedType]);

  // When selectedOrderId changes or ordersList loads, auto-populate client and recommended amount
  useEffect(() => {
    if (!selectedOrderId || ordersList.length === 0) return;
    const ord = ordersList.find((o) => o.id === selectedOrderId);
    if (ord) {
      if (ord.clientId) setSelectedClientId(ord.clientId);
      if (invoiceType === "PROFORMA") {
        const advPct = ord.advancePaymentPercentage || 25;
        const advVal = Math.round((ord.agreedContractValue * advPct) / 100);
        setTaxableValue(String(advVal));
        setNotes(`Advance Mobilization Payment (${advPct}%) against Work Order ${ord.orderNumber}`);
      } else {
        setTaxableValue(String(ord.agreedContractValue));
        setNotes(`Stage / Milestone progress billing against Work Order ${ord.orderNumber}`);
      }
    }
  }, [selectedOrderId, ordersList, invoiceType]);

  async function fetchInvoices() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/invoices");
      const data = await res.json();
      if (res.ok && data.invoices) {
        setInvoices(data.invoices);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchClientsAndOrders() {
    try {
      const [resClients, resOrders] = await Promise.all([
        fetch("/api/admin/enquiries"),
        fetch("/api/admin/orders"),
      ]);
      const dataClients = await resClients.json();
      const dataOrders = await resOrders.json();

      if (dataClients.enquiries) {
        const seen = new Set();
        const list: any[] = [];
        for (const e of dataClients.enquiries) {
          if (!seen.has(e.clientId)) {
            seen.add(e.clientId);
            list.push({ id: e.clientId, name: e.clientName, companyName: e.companyName });
          }
        }
        setClientsList(list);
        if (list.length > 0 && !selectedClientId) setSelectedClientId(list[0].id);
      }

      if (dataOrders.orders) {
        setOrdersList(dataOrders.orders);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreateInvoice(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClientId,
          orderConfirmationId: selectedOrderId || null,
          invoiceType,
          invoiceDate,
          dueDate: dueDate || null,
          taxableValue: Number(taxableValue),
          gstRate,
          isInterState,
          notes,
        }),
      });

      if (res.ok) {
        setCreateModalOpen(false);
        setTaxableValue("");
        setNotes("");
        fetchInvoices();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create invoice");
      }
    } catch (err) {
      console.error(err);
      alert("Network error creating invoice");
    } finally {
      setCreating(false);
    }
  }

  function openEditModal(inv: InvoiceItem) {
    setEditingId(inv.id);
    setEditInvoiceNumber(inv.invoiceNumber);
    setEditTaxableValue(String(inv.taxableValue));
    setEditGstRate(inv.gstRate || 18);
    setEditInvoiceDate(inv.invoiceDate || "");
    setEditDueDate(inv.dueDate || "");
    setEditNotes(inv.notes || "");
    setEditPaymentStatus(inv.paymentStatus || "UNPAID");
    setEditModalOpen(true);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setSavingEdit(true);

    try {
      const res = await fetch(`/api/admin/invoices/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taxableValue: Number(editTaxableValue),
          gstRate: editGstRate,
          invoiceDate: editInvoiceDate,
          dueDate: editDueDate || null,
          notes: editNotes || null,
          paymentStatus: editPaymentStatus,
        }),
      });

      if (res.ok) {
        setEditModalOpen(false);
        setEditingId(null);
        fetchInvoices();
      } else {
        alert("Failed to update invoice");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving invoice");
    } finally {
      setSavingEdit(false);
    }
  }

  function openDeleteModal(inv: InvoiceItem) {
    setInvoiceToDelete(inv);
    setDeleteModalOpen(true);
  }

  async function handleConfirmDelete() {
    if (!invoiceToDelete) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/invoices/${invoiceToDelete.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDeleteModalOpen(false);
        setInvoiceToDelete(null);
        fetchInvoices();
      } else {
        alert("Failed to delete invoice");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting invoice");
    } finally {
      setDeleting(false);
    }
  }

  async function handleRecordPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!activeInvoice) return;
    setRecordingPayment(true);

    try {
      const res = await fetch(`/api/admin/invoices/${activeInvoice.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(paymentAmount),
          paymentMode,
          referenceNumber,
          paymentDate,
          notes: paymentNotes,
        }),
      });

      if (res.ok) {
        setPaymentModalOpen(false);
        setActiveInvoice(null);
        setPaymentAmount("");
        setReferenceNumber("");
        setPaymentNotes("");
        fetchInvoices();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRecordingPayment(false);
    }
  }

  const numTaxable = Number(taxableValue) || 0;
  const numGst = Math.round(numTaxable * (gstRate / 100));
  const numTotal = Math.round(numTaxable + numGst);

  const editNumTaxable = Number(editTaxableValue) || 0;
  const editNumGst = Math.round(editNumTaxable * (editGstRate / 100));
  const editNumTotal = Math.round(editNumTaxable + editNumGst);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(search.toLowerCase()) ||
      (inv.companyName && inv.companyName.toLowerCase().includes(search.toLowerCase())) ||
      (inv.orderNumber && inv.orderNumber.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || inv.paymentStatus === statusFilter;
    const matchesType = typeFilter === "ALL" || inv.invoiceType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-cyan-600" />
            Sales Invoicing & Advance Billing
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate and manage Proforma Invoices (PI Demand Notes) and GST Tax Invoices (SAC 9954) linked to confirmed work orders.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5">
          <button
            suppressHydrationWarning
            onClick={() => fetchInvoices()}
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 shadow-xs transition cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            suppressHydrationWarning
            onClick={() => {
              setInvoiceType("PROFORMA");
              setCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            Issue Proforma (PI)
          </button>
          <button
            suppressHydrationWarning
            onClick={() => {
              setInvoiceType("TAX_INVOICE");
              setCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Generate Tax Invoice
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            suppressHydrationWarning
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice no, client, company, work order..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {/* Document Type Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {[
              { val: "ALL", label: "All Docs" },
              { val: "PROFORMA", label: "Proforma (PI)" },
              { val: "TAX_INVOICE", label: "Tax Invoices" },
            ].map((t) => (
              <button suppressHydrationWarning
                key={t.val}
                type="button"
                onClick={() => setTypeFilter(t.val)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  typeFilter === t.val
                    ? "bg-white text-slate-900 font-bold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Payment Status Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {[
              { val: "ALL", label: "All Status" },
              { val: "UNPAID", label: "Unpaid" },
              { val: "PARTIAL", label: "Partial" },
              { val: "PAID", label: "Paid" },
            ].map((opt) => (
              <button
                suppressHydrationWarning
                key={opt.val}
                onClick={() => setStatusFilter(opt.val)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition shrink-0 ${
                  statusFilter === opt.val
                    ? "bg-cyan-600 text-white font-bold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-cyan-600" />
          Loading billing invoices...
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200/90 p-8 shadow-xs">
          <Receipt className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <div className="text-sm font-bold text-slate-800">No invoices found</div>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Click &quot;Issue Proforma (PI)&quot; or &quot;Generate Tax Invoice&quot; to issue an official bill against any client or active project.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-600 uppercase tracking-wider border-b border-slate-200 font-bold text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 w-36">Document #</th>
                  <th className="py-3.5 px-2.5 w-24">Type</th>
                  <th className="py-3.5 px-3 w-28">Date</th>
                  <th className="py-3.5 px-4">Client & Company</th>
                  <th className="py-3.5 px-3 w-32">Work Order</th>
                  <th className="py-3.5 px-3 w-28 text-right">Taxable</th>
                  <th className="py-3.5 px-3 w-28 text-right">GST (18%)</th>
                  <th className="py-3.5 px-3 w-32 text-right">Total Amount</th>
                  <th className="py-3.5 px-3 w-28 text-right">Paid</th>
                  <th className="py-3.5 px-3 w-32 text-right">Balance Due</th>
                  <th className="py-3.5 px-3 w-24 text-center">Status</th>
                  <th className="py-3.5 px-4 w-44 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition group">
                    {/* Invoice Number */}
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 whitespace-nowrap">
                      <span className="font-mono text-slate-900">{inv.invoiceNumber}</span>
                    </td>

                    {/* Document Type Badge */}
                    <td className="py-3.5 px-2.5 whitespace-nowrap">
                      {inv.invoiceType === "PROFORMA" ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
                          PROFORMA
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-cyan-50 text-cyan-800 border border-cyan-200">
                          TAX INV
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                      {inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : "-"}
                    </td>

                    {/* Client & Company */}
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900 text-sm">{inv.clientName}</div>
                      {inv.companyName && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-amber-500 shrink-0" />
                          <span className="truncate max-w-xs">{inv.companyName}</span>
                        </div>
                      )}
                      <div className="text-slate-500 text-[11px] mt-0.5">{inv.clientPhone}</div>
                    </td>

                    {/* Work Order */}
                    <td className="py-3.5 px-3 font-mono text-slate-700 font-semibold">
                      {inv.orderNumber ? (
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-mono text-slate-800">
                          {inv.orderNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Direct</span>
                      )}
                    </td>

                    {/* Taxable */}
                    <td className="py-3.5 px-3 text-right font-semibold text-slate-800">
                      ₹{inv.taxableValue.toLocaleString("en-IN")}
                    </td>

                    {/* GST */}
                    <td className="py-3.5 px-3 text-right text-slate-500">
                      ₹{Math.round(inv.cgstAmount + inv.sgstAmount + inv.igstAmount).toLocaleString("en-IN")}
                    </td>

                    {/* Total Amount */}
                    <td className="py-3.5 px-3 text-right font-extrabold text-slate-900 text-sm">
                      ₹{inv.totalInvoiceAmount.toLocaleString("en-IN")}
                    </td>

                    {/* Paid */}
                    <td className="py-3.5 px-3 text-right font-semibold text-emerald-600">
                      ₹{inv.amountPaid.toLocaleString("en-IN")}
                    </td>

                    {/* Balance */}
                    <td className="py-3.5 px-3 text-right font-extrabold text-rose-600 text-sm">
                      ₹{inv.balanceAmount.toLocaleString("en-IN")}
                    </td>

                    {/* Payment Status */}
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          inv.paymentStatus === "PAID"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : inv.paymentStatus === "PARTIAL"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-rose-50 text-rose-800 border-rose-200"
                        }`}
                      >
                        {inv.paymentStatus}
                      </span>
                    </td>

                    {/* Actions: View/Print, Record Payment, Edit, Delete */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View / Print PDF */}
                        <button
                          suppressHydrationWarning
                          onClick={() => setPrintInvoice(inv)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                          title="View / Print Document"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-600" />
                        </button>

                        {/* Record Payment */}
                        {inv.paymentStatus !== "PAID" && (
                          <button
                            suppressHydrationWarning
                            onClick={() => {
                              setActiveInvoice(inv);
                              setPaymentAmount(String(inv.balanceAmount));
                              setPaymentModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition cursor-pointer"
                            title="Record Client Payment"
                          >
                            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                          </button>
                        )}

                        {/* Edit Invoice */}
                        <button
                          suppressHydrationWarning
                          onClick={() => openEditModal(inv)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                          title="Edit Document"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                        </button>

                        {/* Delete Invoice */}
                        <button
                          suppressHydrationWarning
                          onClick={() => openDeleteModal(inv)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition cursor-pointer"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EDIT INVOICE MODAL */}
      {/* ======================================================== */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                Edit Document: <span className="font-mono text-cyan-600">{editInvoiceNumber}</span>
              </h2>
              <button
                suppressHydrationWarning
                onClick={() => setEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Taxable Value (₹) *</label>
                  <input
                    suppressHydrationWarning
                    type="number"
                    required
                    value={editTaxableValue}
                    onChange={(e) => setEditTaxableValue(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">GST Rate (%)</label>
                  <select
                    suppressHydrationWarning
                    value={editGstRate}
                    onChange={(e) => setEditGstRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value={18}>18% (Standard Civil SAC 9954)</option>
                    <option value={12}>12% (Affordable Housing)</option>
                    <option value={5}>5%</option>
                    <option value={0}>0% (Exempt)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Output GST ({editGstRate}%):</span>
                  <span className="font-semibold text-slate-900">₹{editNumGst.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold pt-1 border-t border-slate-200">
                  <span>Total Calculated Amount:</span>
                  <span className="text-amber-600 font-extrabold text-sm">₹{editNumTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Date *</label>
                  <input
                    suppressHydrationWarning
                    type="date"
                    required
                    value={editInvoiceDate}
                    onChange={(e) => setEditInvoiceDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Due Date</label>
                  <input
                    suppressHydrationWarning
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Status</label>
                <select
                  suppressHydrationWarning
                  value={editPaymentStatus}
                  onChange={(e) => setEditPaymentStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="UNPAID">UNPAID</option>
                  <option value="PARTIAL">PARTIAL</option>
                  <option value="PAID">PAID</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Notes / Work Description</label>
                <textarea
                  suppressHydrationWarning
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  suppressHydrationWarning
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 cursor-pointer disabled:opacity-50"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DELETE INVOICE MODAL */}
      {/* ======================================================== */}
      {deleteModalOpen && invoiceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center gap-3 text-rose-500 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Delete Document</h3>
                <p className="text-xs text-slate-500">All recorded payments will also be erased.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Are you sure you want to delete Document{" "}
              <span className="font-mono font-bold text-slate-900">{invoiceToDelete.invoiceNumber}</span> for{" "}
              <span className="font-extrabold text-slate-900">{invoiceToDelete.clientName}</span>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                suppressHydrationWarning
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 cursor-pointer disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Delete Document"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CREATE INVOICE / PROFORMA MODAL */}
      {/* ======================================================== */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                {invoiceType === "PROFORMA" ? (
                  <>
                    <FileText className="w-5 h-5 text-amber-500" />
                    Issue Proforma Invoice (Advance Note)
                  </>
                ) : (
                  <>
                    <Receipt className="w-5 h-5 text-cyan-600" />
                    Generate GST Tax Invoice (SAC 9954)
                  </>
                )}
              </h2>
              <button
                suppressHydrationWarning
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Type Switcher */}
            <div className="mb-4 bg-slate-100 p-1 rounded-xl flex items-center gap-1.5 text-xs font-bold">
              <button suppressHydrationWarning
                type="button"
                onClick={() => setInvoiceType("PROFORMA")}
                className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                  invoiceType === "PROFORMA"
                    ? "bg-white text-slate-900 font-extrabold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                Proforma Invoice (PI)
              </button>
              <button suppressHydrationWarning
                type="button"
                onClick={() => setInvoiceType("TAX_INVOICE")}
                className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                  invoiceType === "TAX_INVOICE"
                    ? "bg-white text-slate-900 font-extrabold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Receipt className="w-3.5 h-3.5 text-cyan-600" />
                GST Tax Invoice (Official)
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Linked Work Order / Confirmed Project
                </label>
                <select
                  suppressHydrationWarning
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="">-- No linked work order (Direct billing) --</option>
                  {ordersList.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.orderNumber} — {o.clientName} (₹{o.agreedContractValue.toLocaleString("en-IN")}, Adv: {o.advancePaymentPercentage || 25}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Client Profile *
                </label>
                <select
                  suppressHydrationWarning
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                >
                  {clientsList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.companyName ? `(${c.companyName})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Taxable Amount (₹) *
                  </label>
                  <input
                    suppressHydrationWarning
                    type="number"
                    required
                    value={taxableValue}
                    onChange={(e) => setTaxableValue(e.target.value)}
                    placeholder="e.g. 250000"
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    GST Rate (%)
                  </label>
                  <select
                    suppressHydrationWarning
                    value={gstRate}
                    onChange={(e) => setGstRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value={18}>18% (Standard Civil SAC 9954)</option>
                    <option value={12}>12% (Affordable Housing)</option>
                    <option value={5}>5%</option>
                    <option value={0}>0% (Exempt)</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-500">
                  <span>Taxable:</span>
                  <span className="font-semibold text-slate-900">₹{numTaxable.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Output GST ({gstRate}%):</span>
                  <span className="font-semibold text-cyan-600">₹{numGst.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold pt-1.5 border-t border-slate-200 text-sm">
                  <span>Total Calculated Value:</span>
                  <span className="text-amber-600 font-extrabold">₹{numTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Document Date *</label>
                  <input
                    suppressHydrationWarning
                    type="date"
                    required
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Due Date</label>
                  <input
                    suppressHydrationWarning
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Milestone Remarks
                </label>
                <textarea
                  suppressHydrationWarning
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Mobilization Advance for construction commencement..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  suppressHydrationWarning
                  type="submit"
                  disabled={creating}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg cursor-pointer disabled:opacity-50 ${
                    invoiceType === "PROFORMA"
                      ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20"
                      : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/20"
                  }`}
                >
                  {creating ? "Generating..." : invoiceType === "PROFORMA" ? "Issue Proforma PI" : "Generate Tax Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* RECORD PAYMENT MODAL */}
      {/* ======================================================== */}
      {paymentModalOpen && activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                Record Payment: <span className="font-mono text-cyan-600">{activeInvoice.invoiceNumber}</span>
              </h2>
              <button
                suppressHydrationWarning
                onClick={() => setPaymentModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 mb-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Total Document Value:</span>
                <span className="font-semibold text-slate-900">₹{activeInvoice.totalInvoiceAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Current Remaining Balance:</span>
                <span className="font-bold text-rose-600">₹{activeInvoice.balanceAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Amount Paid (₹) *</label>
                  <input
                    suppressHydrationWarning
                    type="number"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Mode *</label>
                  <select
                    suppressHydrationWarning
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="NEFT_RTGS">NEFT / RTGS</option>
                    <option value="UPI">UPI</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reference / UTR / Cheque #</label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="e.g. UTR12345678"
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Date *</label>
                  <input
                    suppressHydrationWarning
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Receipt Remarks</label>
                <input
                  suppressHydrationWarning
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Cleared via HDFC Bank Current Account"
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  suppressHydrationWarning
                  type="submit"
                  disabled={recordingPayment}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                >
                  {recordingPayment ? "Saving..." : "Record Payment Receipt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PRINT / DOWNLOAD LETTERHEAD MODAL */}
      {/* ======================================================== */}
      {printInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-3xl bg-white text-slate-900 rounded-2xl shadow-2xl max-h-[96vh] flex flex-col overflow-hidden">
            {/* Top Action Header (Hidden in Print) */}
            <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-xs">
                  {printInvoice.invoiceType === "PROFORMA" ? "PROFORMA INVOICE" : "TAX INVOICE"}:
                </span>
                <span className="font-mono text-cyan-400 text-xs font-bold">{printInvoice.invoiceNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  suppressHydrationWarning
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                </button>
                <button
                  suppressHydrationWarning
                  onClick={() => setPrintInvoice(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Body (Printable Letterhead) */}
            <div className="p-8 md:p-12 overflow-y-auto flex-1 font-sans text-xs bg-white text-slate-900">
              {/* Letterhead Top Banner */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5 mb-6">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-950">KANDHAN GROUPS</h1>
                  <p className="text-[10px] uppercase tracking-widest text-amber-700 font-extrabold mt-0.5">
                    Infrastructure • Civil Engineering • PMC & Turnkey Solutions
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Corporate Office: Erode / Coimbatore, Tamil Nadu, India<br />
                    Phone: +91 94432 12345 • Email: projects@kandhangroups.com
                  </p>
                  <div className="inline-block mt-2 px-2.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono font-bold text-slate-800 border border-slate-300">
                    GSTIN: 33AAAAA0000A1Z5 • PAN: ABCDE1234F
                  </div>
                </div>

                <div className="text-right">
                  <div className={`inline-block px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider mb-2 ${
                    printInvoice.invoiceType === "PROFORMA"
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : "bg-cyan-100 text-cyan-900 border border-cyan-300"
                  }`}>
                    {printInvoice.invoiceType === "PROFORMA"
                      ? "PROFORMA INVOICE (DEMAND NOTE)"
                      : "GST TAX INVOICE (SAC 9954)"}
                  </div>
                  <div className="text-lg font-black font-mono text-slate-950">{printInvoice.invoiceNumber}</div>
                  <div className="text-slate-600 text-[11px] mt-1 font-semibold">Date: {printInvoice.invoiceDate}</div>
                  {printInvoice.dueDate && (
                    <div className="text-slate-600 text-[11px]">Due Date: {printInvoice.dueDate}</div>
                  )}
                  {printInvoice.orderNumber && (
                    <div className="text-slate-800 font-mono text-[11px] font-bold mt-1">
                      Ref Work Order: {printInvoice.orderNumber}
                    </div>
                  )}
                </div>
              </div>

              {/* Client Billed-To Card */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Billed To (Client):</div>
                  <div className="font-extrabold text-sm text-slate-950">{printInvoice.clientName}</div>
                  {printInvoice.companyName && (
                    <div className="text-slate-700 font-semibold text-xs mt-0.5">{printInvoice.companyName}</div>
                  )}
                  <div className="text-slate-600 text-xs mt-1">Phone: {printInvoice.clientPhone}</div>
                  {printInvoice.gstin && (
                    <div className="text-slate-800 font-mono text-[11px] font-bold mt-0.5">
                      Client GSTIN: {printInvoice.gstin}
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Billing Specifics:</div>
                  <div className="text-xs text-slate-700">
                    <span className="font-semibold text-slate-900">Service Category:</span> Civil Construction Works
                  </div>
                  <div className="text-xs text-slate-700 mt-1">
                    <span className="font-semibold text-slate-900">SAC Code:</span> 9954 (Construction Services)
                  </div>
                  <div className="text-xs text-slate-700 mt-1">
                    <span className="font-semibold text-slate-900">Payment Status:</span>{" "}
                    <span className="font-bold text-slate-900">{printInvoice.paymentStatus}</span>
                  </div>
                </div>
              </div>

              {/* Items / Description Table */}
              <table className="w-full text-left border-collapse border border-slate-300 mb-6">
                <thead>
                  <tr className="bg-slate-100 font-bold text-[11px] text-slate-800 uppercase tracking-wider">
                    <th className="p-3 border border-slate-300 w-12 text-center">#</th>
                    <th className="p-3 border border-slate-300">Description of Civil Work / Milestone</th>
                    <th className="p-3 border border-slate-300 text-center w-24">SAC Code</th>
                    <th className="p-3 border border-slate-300 text-right w-36">Taxable Value (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-3 border border-slate-300 text-center font-bold text-slate-600">1</td>
                    <td className="p-3 border border-slate-300">
                      <div className="font-bold text-slate-900">
                        {printInvoice.invoiceType === "PROFORMA"
                          ? "Mobilization Advance Payment for Construction Works"
                          : "Civil Construction Execution Services (SAC 9954)"}
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1">
                        {printInvoice.notes || "As per signed Work Order agreement & schedule."}
                      </div>
                    </td>
                    <td className="p-3 border border-slate-300 text-center font-mono font-bold text-slate-800">9954</td>
                    <td className="p-3 border border-slate-300 text-right font-extrabold text-slate-950 text-sm">
                      ₹{printInvoice.taxableValue.toLocaleString("en-IN")}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Financial Calculation Summary & Bank Wire Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                {/* Bank Transfer Details Box */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 space-y-1.5">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2">
                    <Landmark className="w-3.5 h-3.5 text-amber-600" />
                    Official Bank Details for RTGS / NEFT / IMPS
                  </div>
                  <div className="text-[11px] flex justify-between">
                    <span className="text-slate-500">Beneficiary:</span>
                    <span className="font-bold text-slate-950">KANDHAN GROUPS</span>
                  </div>
                  <div className="text-[11px] flex justify-between">
                    <span className="text-slate-500">Bank Name:</span>
                    <span className="font-semibold text-slate-900">HDFC Bank Limited</span>
                  </div>
                  <div className="text-[11px] flex justify-between">
                    <span className="text-slate-500">Account Number:</span>
                    <span className="font-mono font-bold text-slate-950">50200088923412 (Current A/C)</span>
                  </div>
                  <div className="text-[11px] flex justify-between">
                    <span className="text-slate-500">IFSC Code:</span>
                    <span className="font-mono font-bold text-slate-950">HDFC0001234</span>
                  </div>
                  <div className="text-[11px] flex justify-between">
                    <span className="text-slate-500">Branch:</span>
                    <span className="font-semibold text-slate-900">Erode Main Branch</span>
                  </div>
                </div>

                {/* Tax Breakdown & Total */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Value:</span>
                    <span className="font-semibold text-slate-900">₹{printInvoice.taxableValue.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>CGST (9.0%):</span>
                    <span className="font-semibold text-slate-900">₹{printInvoice.cgstAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>SGST (9.0%):</span>
                    <span className="font-semibold text-slate-900">₹{printInvoice.sgstAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="pt-2 border-t-2 border-slate-900 flex justify-between font-black text-sm text-slate-950">
                    <span>Grand Total Invoice Value:</span>
                    <span className="text-amber-700">₹{printInvoice.totalInvoiceAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-semibold pt-1">
                    <span>Amount Received:</span>
                    <span>₹{printInvoice.amountPaid.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-rose-700 font-extrabold text-sm border-t border-slate-200 pt-1">
                    <span>Balance Due:</span>
                    <span>₹{printInvoice.balanceAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Proforma Disclaimer or GST Certification */}
              {printInvoice.invoiceType === "PROFORMA" ? (
                <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 leading-relaxed mb-8">
                  <span className="font-bold">PROFORMA DEMAND NOTICE:</span> This document is a commercial demand note issued strictly for requesting project mobilization advance against the confirmed Work Order. An official GST Tax Invoice with SAC 9954 classification will be released upon payment realization & commencement of site activities.
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed mb-8">
                  <span className="font-bold text-slate-900">GST DECLARATION:</span> We hereby declare that this invoice shows the actual value of civil construction services described and that all particulars are true and correct as per the Central Goods and Services Tax Act, 2017.
                </div>
              )}

              {/* Signature Block (Kandhan Groups Authorized Signatory Only) */}
              <div className="pt-6 border-t border-slate-200 flex justify-between items-end">
                <div className="text-[10px] text-slate-500 space-y-0.5">
                  <div>Computer-generated document by Kandhan Groups Business Suite.</div>
                  <div>Subject to Erode / Coimbatore legal jurisdiction.</div>
                </div>

                <div className="text-right">
                  <div className="font-black text-xs text-slate-950 uppercase tracking-wider">
                    For KANDHAN GROUPS
                  </div>
                  <div className="w-52 h-14 border border-dashed border-slate-300 rounded-lg my-2 flex items-center justify-center text-[10px] text-slate-400 bg-slate-50">
                    [ Official Seal & Signature ]
                  </div>
                  <div className="font-extrabold text-xs text-slate-900">Authorized Signatory</div>
                  <div className="text-[10px] text-slate-500">Managing Director / Partner</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
