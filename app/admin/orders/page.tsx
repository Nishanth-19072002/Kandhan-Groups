"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileCheck2,
  Calendar,
  Building,
  Receipt,
  ShoppingCart,
  Search,
  CheckCircle2,
  Edit3,
  Trash2,
  X,
  AlertTriangle,
  RefreshCw,
  HardHat,
  Clock,
  Printer,
  Share2,
  FileText,
  UploadCloud,
  Paperclip,
  ExternalLink,
} from "lucide-react";

interface OrderItem {
  id: string;
  orderNumber: string;
  clientPoReference: string | null;
  signedContractUrl: string | null;
  contractTerms: string | null;
  agreedContractValue: number;
  advanceAgreed: number;
  startDate: string;
  expectedCompletionDate: string | null;
  status: string;
  createdAt: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  companyName: string | null;
  quotationId: string;
  quoteNumber: string;
  engineerName: string | null;
  bankAccountId: string | null;
}

export default function WorkOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editOrderNumber, setEditOrderNumber] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editCompletionDate, setEditCompletionDate] = useState("");
  const [editContractValue, setEditContractValue] = useState("");
  const [editAdvanceAgreed, setEditAdvanceAgreed] = useState("");
  const [editClientPoRef, setEditClientPoRef] = useState("");
  const [editStatus, setEditStatus] = useState("ACTIVE");
  const [editContractTerms, setEditContractTerms] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<OrderItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Contract View / Print Modal State
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [activeContract, setActiveContract] = useState<any>(null);
  const [loadingContract, setLoadingContract] = useState(false);

  // Upload Signed Copy Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [orderToUpload, setOrderToUpload] = useState<OrderItem | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (res.ok && data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openEditModal(ord: OrderItem) {
    setEditingId(ord.id);
    setEditOrderNumber(ord.orderNumber);
    setEditStartDate(ord.startDate || "");
    setEditCompletionDate(ord.expectedCompletionDate || "");
    setEditContractValue(String(ord.agreedContractValue));
    setEditAdvanceAgreed(String(ord.advanceAgreed));
    setEditClientPoRef(ord.clientPoReference || "");
    setEditStatus(ord.status || "ACTIVE");
    setEditContractTerms(ord.contractTerms || "");
    setEditModalOpen(true);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setSavingEdit(true);

    try {
      const res = await fetch(`/api/admin/orders/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: editStartDate,
          expectedCompletionDate: editCompletionDate || null,
          agreedContractValue: Number(editContractValue),
          advanceAgreed: Number(editAdvanceAgreed),
          clientPoReference: editClientPoRef || null,
          contractTerms: editContractTerms || null,
          status: editStatus,
        }),
      });

      if (res.ok) {
        setEditModalOpen(false);
        setEditingId(null);
        fetchOrders();
      } else {
        alert("Failed to update work order");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving work order");
    } finally {
      setSavingEdit(false);
    }
  }

  function openDeleteModal(ord: OrderItem) {
    setOrderToDelete(ord);
    setDeleteError("");
    setDeleteModalOpen(true);
  }

  async function handleConfirmDelete() {
    if (!orderToDelete) return;
    setDeleting(true);
    setDeleteError("");

    try {
      const res = await fetch(`/api/admin/orders/${orderToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        setDeleteModalOpen(false);
        setOrderToDelete(null);
        fetchOrders();
      } else {
        setDeleteError(data.error || "Failed to delete work order");
      }
    } catch (err) {
      console.error(err);
      setDeleteError("Error deleting work order");
    } finally {
      setDeleting(false);
    }
  }

  // Open & Fetch Contract Agreement for View/Print
  async function openContractAgreement(orderId: string) {
    setContractModalOpen(true);
    setLoadingContract(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      const data = await res.json();
      if (res.ok) {
        setActiveContract(data);
      } else {
        alert(data.error || "Failed to fetch contract details");
      }
    } catch (err) {
      console.error("Error fetching contract:", err);
    } finally {
      setLoadingContract(false);
    }
  }

  // Open Upload Modal
  function openUploadModal(ord: OrderItem) {
    setOrderToUpload(ord);
    setSelectedFile(null);
    setUploadError("");
    setUploadModalOpen(true);
  }

  // Handle File Upload Submit
  async function handleUploadSignedContract(e: React.FormEvent) {
    e.preventDefault();
    if (!orderToUpload || !selectedFile) return;

    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const upRes = await fetch("/api/admin/orders/upload", {
        method: "POST",
        body: formData,
      });

      const upData = await upRes.json();
      if (!upRes.ok || !upData.fileUrl) {
        setUploadError(upData.error || "Failed to upload document file");
        setUploading(false);
        return;
      }

      // Link file URL to order
      const putRes = await fetch(`/api/admin/orders/${orderToUpload.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signedContractUrl: upData.fileUrl,
        }),
      });

      if (putRes.ok) {
        setUploadModalOpen(false);
        setOrderToUpload(null);
        setSelectedFile(null);
        fetchOrders();
      } else {
        setUploadError("Uploaded successfully but failed to link to work order");
      }
    } catch (err) {
      console.error(err);
      setUploadError("Network error while uploading file");
    } finally {
      setUploading(false);
    }
  }

  function shareContractWhatsApp(contractData: any) {
    const o = contractData.order;
    const msg = `*KANDHAN GROUPS — WORK ORDER & CONTRACT*\n*Order No:* ${o.orderNumber}\n*Client:* ${o.clientName}\n*Agreed Value:* ₹${Number(o.agreedContractValue).toLocaleString("en-IN")}\n*Start Date:* ${o.startDate ? new Date(o.startDate).toLocaleDateString() : "Immediate"}\n\nCivil Construction • Industrial Infrastructure • PMC`;
    const cleanPhone = (o.clientPhone || "").replace(/\D/g, "");
    const url = cleanPhone
      ? `https://wa.me/91${cleanPhone.slice(-10)}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  }

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.clientName.toLowerCase().includes(search.toLowerCase()) ||
      o.quoteNumber.toLowerCase().includes(search.toLowerCase()) ||
      (o.companyName && o.companyName.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileCheck2 className="w-6 h-6 text-emerald-500" />
            Confirmed Work Orders & Project Contracts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise management of legally confirmed civil construction projects, contract agreements, signed PO uploads, and tax billing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            suppressHydrationWarning
            onClick={() => fetchOrders()}
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 shadow-xs transition cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
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
            placeholder="Search by order #, client, company, quote #..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { val: "ALL", label: "All Projects" },
            { val: "ACTIVE", label: "Active" },
            { val: "IN_PROGRESS", label: "In Progress" },
            { val: "COMPLETED", label: "Completed" },
            { val: "ON_HOLD", label: "On Hold" },
          ].map((opt) => (
            <button
              suppressHydrationWarning
              key={opt.val}
              onClick={() => setStatusFilter(opt.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                statusFilter === opt.val
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Work Orders Table */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
          Loading active project orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200/90 p-8 shadow-xs">
          <FileCheck2 className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <div className="text-sm font-bold text-slate-800">No confirmed work orders found</div>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Once a client accepts a quotation, click &quot;Confirm Order&quot; on the Quotations page to issue a formal Work Order here.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-600 uppercase tracking-wider border-b border-slate-200 font-bold text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 w-40">Work Order #</th>
                  <th className="py-3.5 px-4">Client & Company</th>
                  <th className="py-3.5 px-3 w-32">Ref Quotation</th>
                  <th className="py-3.5 px-3 w-36 text-right">Contract Value</th>
                  <th className="py-3.5 px-3 w-32 text-right">Advance Agreed</th>
                  <th className="py-3.5 px-3 w-28">Start Date</th>
                  <th className="py-3.5 px-3 w-28">Completion</th>
                  <th className="py-3.5 px-3 w-28 text-center">Status</th>
                  <th className="py-3.5 px-4 w-48 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50 transition group">
                    {/* Order Number & Signed Copy Badge */}
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-mono text-emerald-700">
                        {ord.orderNumber}
                      </div>
                      {ord.clientPoReference && (
                        <div className="text-[10px] text-slate-500 mt-0.5">PO: {ord.clientPoReference}</div>
                      )}
                      {ord.signedContractUrl ? (
                        <a
                          href={ord.signedContractUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold hover:bg-emerald-100"
                          title="Open uploaded signed copy"
                        >
                          <Paperclip className="w-3 h-3" /> Signed Copy (PDF)
                        </a>
                      ) : (
                        <button
                          suppressHydrationWarning
                          type="button"
                          onClick={() => openUploadModal(ord)}
                          className="inline-flex items-center gap-1 mt-1 text-[10px] text-amber-700 hover:text-amber-800 font-medium"
                          title="Attach signed PO / Agreement"
                        >
                          <UploadCloud className="w-3 h-3" /> Attach Signed Copy
                        </button>
                      )}
                    </td>

                    {/* Client & Company */}
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900 text-sm">{ord.clientName}</div>
                      {ord.companyName && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-amber-500 shrink-0" />
                          <span className="truncate max-w-xs">{ord.companyName}</span>
                        </div>
                      )}
                      <div className="text-slate-500 text-[11px] mt-0.5">{ord.clientPhone}</div>
                    </td>

                    {/* Ref Quote */}
                    <td className="py-3.5 px-3">
                      <Link
                        href={`/admin/quotations?quoteId=${ord.quotationId}`}
                        className="font-mono text-amber-700 hover:text-amber-800 font-semibold underline decoration-slate-300"
                      >
                        {ord.quoteNumber}
                      </Link>
                    </td>

                    {/* Contract Value */}
                    <td className="py-3.5 px-3 text-right font-extrabold text-amber-700 text-sm">
                      ₹{ord.agreedContractValue.toLocaleString("en-IN")}
                    </td>

                    {/* Advance Agreed */}
                    <td className="py-3.5 px-3 text-right text-emerald-700 font-semibold">
                      ₹{ord.advanceAgreed.toLocaleString("en-IN")}
                    </td>

                    {/* Start Date */}
                    <td className="py-3.5 px-3 text-slate-700 whitespace-nowrap">
                      {ord.startDate ? new Date(ord.startDate).toLocaleDateString() : "-"}
                    </td>

                    {/* Completion Date */}
                    <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                      {ord.expectedCompletionDate ? new Date(ord.expectedCompletionDate).toLocaleDateString() : "TBD"}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          ord.status === "COMPLETED"
                            ? "bg-blue-50 text-blue-800 border-blue-200"
                            : ord.status === "IN_PROGRESS"
                            ? "bg-purple-50 text-purple-800 border-purple-200"
                            : "bg-emerald-50 text-emerald-800 border-emerald-200"
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>

                    {/* Actions: View Agreement, Upload Signed, Bill Shortcut, Edit, Delete */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View & Print Formal Contract Letterhead */}
                        <button
                          suppressHydrationWarning
                          onClick={() => openContractAgreement(ord.id)}
                          className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition cursor-pointer"
                          title="View & Print Official Contract Agreement"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>

                        {/* Upload Signed PO / Contract Modal */}
                        <button
                          suppressHydrationWarning
                          onClick={() => openUploadModal(ord)}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition cursor-pointer"
                          title="Upload Signed Client Copy"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                        </button>

                        {/* Generate Invoice shortcut */}
                        <Link
                          href={`/admin/invoices?orderId=${ord.id}`}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition cursor-pointer"
                          title="Generate Tax Invoice"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                        </Link>

                        {/* Edit Work Order */}
                        <button
                          suppressHydrationWarning
                          onClick={() => openEditModal(ord)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                          title="Edit Work Order"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                        </button>

                        {/* Delete Work Order */}
                        <button
                          suppressHydrationWarning
                          onClick={() => openDeleteModal(ord)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition cursor-pointer"
                          title="Delete Work Order"
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
      {/* VIEW & PRINT FORMAL CONTRACT AGREEMENT MODAL */}
      {/* ======================================================== */}
      {contractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl max-h-[95vh] flex flex-col overflow-hidden">
            {/* Action Bar (Not printed) */}
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-amber-400">
                  {activeContract?.order?.orderNumber || "Work Order Agreement"}
                </span>
                <span className="text-slate-400">• Official Construction Contract</span>
              </div>
              <div className="flex items-center gap-2">
                {activeContract?.order && (
                  <button
                    suppressHydrationWarning
                    onClick={() => shareContractWhatsApp(activeContract)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share WhatsApp
                  </button>
                )}
                <button
                  suppressHydrationWarning
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save Contract PDF
                </button>
                <button
                  suppressHydrationWarning
                  onClick={() => setContractModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {loadingContract || !activeContract ? (
              <div className="text-center py-24 text-slate-500 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                Loading official contract letterhead...
              </div>
            ) : (
              /* Printable Contract Letterhead */
              <div className="p-8 md:p-12 overflow-y-auto flex-1 font-sans text-xs">
                {/* Official Header */}
                <div className="flex items-start justify-between border-b-2 border-amber-500 pb-5 mb-6">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center font-black text-slate-950 text-xl shadow-xs">
                        KG
                      </div>
                      <div>
                        <h1 className="text-2xl font-black text-slate-950 tracking-tight">
                          {activeContract.company?.tradeName || "KANDHAN GROUPS"}
                        </h1>
                        <p className="text-[10px] uppercase tracking-widest text-amber-700 font-extrabold">
                          Civil Construction • Industrial Infrastructure • PMC
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-2 max-w-sm">
                      {activeContract.company?.address || "Industrial Infrastructure & Builders, Tamil Nadu, India"}
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Phone: {activeContract.company?.phone || "+91 94883 44434"} | Email: {activeContract.company?.email || "kandhangroups@gmail.com"}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="inline-block px-3 py-1 rounded bg-amber-100 text-amber-900 font-extrabold text-xs uppercase tracking-wider mb-2">
                      Legal Work Order & Contract
                    </div>
                    <div className="text-sm font-extrabold text-slate-900 font-mono">
                      {activeContract.order.orderNumber}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-700">
                      Ref Quote: {activeContract.order.quoteNumber}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Date: {new Date(activeContract.order.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-[11px] font-bold text-slate-800 mt-1">
                      GSTIN: {activeContract.company?.gstin || "33AAAAA0000A1Z5"}
                    </div>
                  </div>
                </div>

                {/* Part 1: Contracting Parties */}
                <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-amber-800 tracking-wider mb-1">
                      Principal Employer / Client:
                    </div>
                    <div className="font-extrabold text-sm text-slate-900">{activeContract.order.clientName}</div>
                    {activeContract.order.companyName && (
                      <div className="font-semibold text-slate-800">{activeContract.order.companyName}</div>
                    )}
                    <div className="text-slate-600">Phone: {activeContract.order.clientPhone}</div>
                    {activeContract.order.clientEmail && (
                      <div className="text-slate-600">Email: {activeContract.order.clientEmail}</div>
                    )}
                    {activeContract.order.gstin && (
                      <div className="text-slate-700 font-semibold">Client GSTIN: {activeContract.order.gstin}</div>
                    )}
                    {activeContract.order.billingAddress && (
                      <div className="text-slate-600 text-[10px] mt-1">{activeContract.order.billingAddress}</div>
                    )}
                  </div>

                  <div>
                    <div className="text-[10px] uppercase font-bold text-amber-800 tracking-wider mb-1">
                      Site & Project Details:
                    </div>
                    <div className="font-semibold text-slate-900">
                      Site: {activeContract.order.siteAddress || "Site as per agreement"}
                    </div>
                    {activeContract.order.clientPoReference && (
                      <div className="text-slate-700 font-bold mt-1">
                        Client PO Reference: {activeContract.order.clientPoReference}
                      </div>
                    )}
                    <div className="text-slate-600 mt-1">
                      Commencement Date:{" "}
                      <span className="font-bold text-slate-800">
                        {activeContract.order.startDate
                          ? new Date(activeContract.order.startDate).toLocaleDateString()
                          : "Immediate on advance"}
                      </span>
                    </div>
                    <div className="text-slate-600">
                      Target Completion:{" "}
                      <span className="font-bold text-slate-800">
                        {activeContract.order.expectedCompletionDate
                          ? new Date(activeContract.order.expectedCompletionDate).toLocaleDateString()
                          : "As mutually agreed"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Part 2: Scope of Civil Works */}
                <div className="mb-6">
                  <div className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Scope of Works & Bill of Quantities (BOQ)
                  </div>
                  <table className="w-full text-left border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold text-[11px]">
                        <th className="p-2.5 border-r border-slate-300 w-12 text-center">#</th>
                        <th className="p-2.5 border-r border-slate-300">Category & Specification</th>
                        <th className="p-2.5 border-r border-slate-300 w-16 text-center">SAC</th>
                        <th className="p-2.5 border-r border-slate-300 w-16 text-center">Unit</th>
                        <th className="p-2.5 border-r border-slate-300 w-20 text-right">Qty</th>
                        <th className="p-2.5 border-r border-slate-300 w-24 text-right">Rate (₹)</th>
                        <th className="p-2.5 w-28 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {(activeContract.items || []).map((it: any, i: number) => (
                        <tr key={it.id || i}>
                          <td className="p-2.5 border-r border-slate-200 text-center font-semibold text-slate-500">
                            {i + 1}
                          </td>
                          <td className="p-2.5 border-r border-slate-200">
                            <div className="font-bold text-slate-900">{it.category}</div>
                            <div className="text-slate-600 text-[11px]">{it.description}</div>
                          </td>
                          <td className="p-2.5 border-r border-slate-200 text-center text-slate-600">
                            {it.hsnSacCode || "9954"}
                          </td>
                          <td className="p-2.5 border-r border-slate-200 text-center font-medium">
                            {it.unit}
                          </td>
                          <td className="p-2.5 border-r border-slate-200 text-right">
                            {it.quantity}
                          </td>
                          <td className="p-2.5 border-r border-slate-200 text-right">
                            ₹{Number(it.unitRate).toLocaleString("en-IN")}
                          </td>
                          <td className="p-2.5 text-right font-bold text-slate-900">
                            ₹{Number(it.amount).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Part 3: Commercial Consideration Box */}
                <div className="flex justify-end mb-6">
                  <div className="w-80 bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-700">
                      <span className="font-semibold">Agreed Contract Value:</span>
                      <span className="font-black text-sm text-slate-950">
                        ₹{Number(activeContract.order.agreedContractValue).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-emerald-800 pt-1 border-t border-slate-200">
                      <span className="font-semibold">Advance Amount Agreed:</span>
                      <span className="font-black text-sm text-emerald-700">
                        ₹{Number(activeContract.order.advanceAgreed).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 pt-1 border-t border-slate-200">
                      <span>Balance on Stage RA Bills:</span>
                      <span className="font-bold text-slate-800">
                        ₹{(
                          Number(activeContract.order.agreedContractValue) -
                          Number(activeContract.order.advanceAgreed)
                        ).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Part 4: Legal Conditions of Contract & Bank Remittance */}
                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-[11px] text-slate-600">
                  <div>
                    <div className="font-bold text-slate-900 uppercase tracking-wider mb-1">
                      General Conditions of Contract (GCC):
                    </div>
                    <div className="space-y-1.5 leading-relaxed text-[10px]">
                      <p>
                        <strong className="text-slate-800">1. Standards of Execution:</strong> All civil and fabrication works shall adhere strictly to Bureau of Indian Standards (IS 456, IS 1786).
                      </p>
                      <p>
                        <strong className="text-slate-800">2. Billing & Measurement:</strong> Running Account (RA) bills shall be presented based on verified joint measurements taken at site.
                      </p>
                      <p>
                        <strong className="text-slate-800">3. Site Facilities:</strong> The Employer shall provide continuous unobstructed access, adequate construction water, and power connection at the work site.
                      </p>
                      <p>
                        <strong className="text-slate-800">4. Settlement of Disputes:</strong> Any dispute arising out of this contract shall be referred to arbitration under the Indian Arbitration & Conciliation Act, jurisdiction Tamil Nadu.
                      </p>
                      {activeContract.order.contractTerms && (
                        <p className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-900 mt-2 font-medium">
                          <strong>Special Project Terms:</strong> {activeContract.order.contractTerms}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="font-bold text-slate-900 uppercase tracking-wider mb-1">
                      Designated Bank Account for Remittance:
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 space-y-1 text-[11px]">
                      <div className="font-bold text-slate-900">
                        Bank: {activeContract.bankAccount?.bankName || activeContract.company?.bankName || "State Bank of India"}
                      </div>
                      <div>
                        A/C Name: {activeContract.bankAccount?.accountHolderName || activeContract.company?.tradeName || "Kandhan Groups"}
                      </div>
                      <div>
                        Account No:{" "}
                        <span className="font-mono font-bold text-slate-900">
                          {activeContract.bankAccount?.accountNumber || activeContract.company?.accountNumber || "123456789012"}
                        </span>
                      </div>
                      <div>
                        IFSC Code:{" "}
                        <span className="font-mono font-bold text-slate-900">
                          {activeContract.bankAccount?.ifscCode || activeContract.company?.ifscCode || "SBIN0001234"}
                        </span>
                      </div>
                      <div>
                        Branch: {activeContract.bankAccount?.branch || activeContract.company?.branch || "Main Branch"}
                      </div>
                      {(activeContract.bankAccount?.upiId || activeContract.company?.upiId) && (
                        <div className="text-amber-800 font-semibold">
                          UPI: {activeContract.bankAccount?.upiId || activeContract.company?.upiId}
                        </div>
                      )}
                    </div>

                    {/* Dual Attestation Signatures */}
                    <div className="mt-8 flex justify-between items-end text-center">
                      <div>
                        <div className="w-36 border-b border-slate-400 mb-1"></div>
                        <div className="text-[10px] font-bold text-slate-800">
                          Accepted & Confirmed by CLIENT
                        </div>
                        <div className="text-[9px] text-slate-500">Authorized Signature & Seal</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-slate-900">For KANDHAN GROUPS</div>
                        <div className="w-36 border-b border-slate-400 my-4 ml-auto"></div>
                        <div className="text-[9px] text-slate-500">Authorized Signatory</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ATTACH / UPLOAD SIGNED WORK ORDER OR CLIENT PO MODAL */}
      {/* ======================================================== */}
      {uploadModalOpen && orderToUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-blue-600" />
                  Upload Signed Work Order / Client PO
                </h3>
                <p className="text-xs text-slate-500">
                  Attach official signed agreement PDF or scanned client purchase order.
                </p>
              </div>
              <button
                suppressHydrationWarning
                onClick={() => setUploadModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSignedContract} className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div>
                  <span className="text-slate-500">Order Ref:</span>{" "}
                  <span className="font-mono font-bold text-emerald-700">{orderToUpload.orderNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500">Client:</span>{" "}
                  <span className="font-semibold text-slate-900">{orderToUpload.clientName}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Document File (.PDF, .PNG, .JPG) *
                </label>
                <input
                  suppressHydrationWarning
                  type="file"
                  required
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:outline-none"
                />
                {selectedFile && (
                  <p className="text-[11px] text-emerald-700 mt-1 font-medium">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {uploadError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  suppressHydrationWarning
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5" /> Save Document
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EDIT WORK ORDER MODAL */}
      {/* ======================================================== */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                Edit Work Order: <span className="font-mono text-emerald-700">{editOrderNumber}</span>
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contract Value (₹) *</label>
                  <input
                    suppressHydrationWarning
                    type="number"
                    required
                    value={editContractValue}
                    onChange={(e) => setEditContractValue(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Advance Agreed (₹)</label>
                  <input
                    suppressHydrationWarning
                    type="number"
                    value={editAdvanceAgreed}
                    onChange={(e) => setEditAdvanceAgreed(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
                  <input
                    suppressHydrationWarning
                    type="date"
                    required
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Completion Date</label>
                  <input
                    suppressHydrationWarning
                    type="date"
                    value={editCompletionDate}
                    onChange={(e) => setEditCompletionDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Client PO Reference</label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={editClientPoRef}
                    onChange={(e) => setEditClientPoRef(e.target.value)}
                    placeholder="e.g. PO-2026-99"
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Project Status</label>
                  <select
                    suppressHydrationWarning
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="ON_HOLD">ON_HOLD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Special Contract Clauses / Notes</label>
                <textarea
                  rows={3}
                  value={editContractTerms}
                  onChange={(e) => setEditContractTerms(e.target.value)}
                  placeholder="Special milestones, penalty terms, or client materials supply conditions..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900"
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
      {/* DELETE WORK ORDER MODAL */}
      {/* ======================================================== */}
      {deleteModalOpen && orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl text-slate-900">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Delete Work Order</h3>
                <p className="text-xs text-slate-500">Permanently removes this project record.</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed mb-4">
              Are you sure you want to delete Work Order{" "}
              <span className="font-mono font-bold text-emerald-700">{orderToDelete.orderNumber}</span> for{" "}
              <span className="font-extrabold text-slate-900">{orderToDelete.clientName}</span>?
            </p>

            {deleteError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900"
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
                {deleting ? "Deleting..." : "Yes, Delete Work Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}