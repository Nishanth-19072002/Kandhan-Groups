"use client";

import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Plus,
  Search,
  Camera,
  Upload,
  CheckCircle2,
  Clock,
  Building,
  Calendar,
  X,
  FileCheck2,
  Image as ImageIcon,
  ExternalLink,
  ShieldCheck,
  Edit3,
  Trash2,
  Eye,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

interface PurchaseBillItem {
  id: string;
  vendorInvoiceNumber: string;
  billDate: string;
  category: string;
  taxableAmount: number;
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
  inputTaxCreditEligible: number;
  verifiedByAccountant: number;
  notes: string | null;
  createdAt: string;
  vendorId: string;
  vendorName: string;
  vendorPhone: string | null;
  vendorGstin: string | null;
  orderId: string | null;
  orderNumber: string | null;
  clientName: string | null;
  attachments: {
    id: string;
    fileUrl: string;
    fileName: string;
    fileType: string;
  }[];
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<PurchaseBillItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("ALL");

  // Create Bill Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [vendorsList, setVendorsList] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [vendorInvoiceNumber, setVendorInvoiceNumber] = useState("");
  const [billDate, setBillDate] = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState("Cement & Aggregates");
  const [taxableValue, setTaxableValue] = useState("");
  const [gstRate, setGstRate] = useState(18);
  const [isInterState, setIsInterState] = useState(false);
  const [itcEligibility, setItcEligibility] = useState(true);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Edit Bill Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVendorId, setEditVendorId] = useState("");
  const [editInvoiceNumber, setEditInvoiceNumber] = useState("");
  const [editBillDate, setEditBillDate] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editTaxableValue, setEditTaxableValue] = useState("");
  const [editGstRate, setEditGstRate] = useState(18);
  const [editNotes, setEditNotes] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Bill Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState<PurchaseBillItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Add Vendor Quick Modal
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [newVendorName, setNewVendorName] = useState("");
  const [newVendorPhone, setNewVendorPhone] = useState("");
  const [newVendorGstin, setNewVendorGstin] = useState("");
  const [newVendorCategory, setNewVendorCategory] = useState("Cement & Aggregates");
  const [savingVendor, setSavingVendor] = useState(false);

  // Bill Image Viewer Modal
  const [viewImageModal, setViewImageModal] = useState<string | null>(null);

  useEffect(() => {
    fetchPurchases();
    fetchVendors();
    fetchOrders();
  }, []);

  async function fetchPurchases() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/purchases");
      const data = await res.json();
      if (res.ok && data.purchases) {
        setPurchases(data.purchases);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchVendors() {
    try {
      const res = await fetch("/api/admin/vendors");
      const data = await res.json();
      if (res.ok && data.vendors) {
        setVendorsList(data.vendors);
        if (data.vendors.length > 0 && !selectedVendorId) {
          setSelectedVendorId(data.vendors[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchOrders() {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (res.ok && data.orders) {
        setOrdersList(data.orders);
      }
    } catch (err) {
      console.error(err);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  async function handleCreatePurchase(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);

    try {
      let uploadedFileUrl: string | null = null;
      let uploadedFileName: string | null = null;

      if (selectedFile) {
        setUploadingFile(true);
        const form = new FormData();
        form.append("file", selectedFile);
        const uploadRes = await fetch("/api/admin/purchases/upload", {
          method: "POST",
          body: form,
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok) {
          uploadedFileUrl = uploadData.fileUrl;
          uploadedFileName = uploadData.fileName;
        }
      }

      const res = await fetch("/api/admin/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: selectedVendorId,
          orderConfirmationId: selectedOrderId || null,
          vendorInvoiceNumber,
          billDate,
          category,
          taxableValue,
          gstRate,
          isInterState,
          itcEligibility,
          fileUrl: uploadedFileUrl,
          fileName: uploadedFileName,
        }),
      });

      if (res.ok) {
        setCreateModalOpen(false);
        setVendorInvoiceNumber("");
        setTaxableValue("");
        setSelectedFile(null);
        setPreviewUrl(null);
        fetchPurchases();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
      setUploadingFile(false);
    }
  }

  function openEditModal(bill: PurchaseBillItem) {
    setEditingId(bill.id);
    setEditVendorId(bill.vendorId);
    setEditInvoiceNumber(bill.vendorInvoiceNumber);
    setEditBillDate(bill.billDate || "");
    setEditCategory(bill.category || "Cement & Aggregates");
    setEditTaxableValue(String(bill.taxableAmount));
    setEditGstRate(bill.gstRate || 18);
    setEditNotes(bill.notes || "");
    setEditModalOpen(true);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setSavingEdit(true);

    try {
      const res = await fetch(`/api/admin/purchases/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: editVendorId,
          vendorInvoiceNumber: editInvoiceNumber,
          billDate: editBillDate,
          category: editCategory,
          taxableAmount: Number(editTaxableValue),
          gstRate: editGstRate,
          notes: editNotes || null,
        }),
      });

      if (res.ok) {
        setEditModalOpen(false);
        setEditingId(null);
        fetchPurchases();
      } else {
        alert("Failed to update purchase bill");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving purchase bill");
    } finally {
      setSavingEdit(false);
    }
  }

  function openDeleteModal(bill: PurchaseBillItem) {
    setBillToDelete(bill);
    setDeleteModalOpen(true);
  }

  async function handleConfirmDelete() {
    if (!billToDelete) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/purchases/${billToDelete.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDeleteModalOpen(false);
        setBillToDelete(null);
        fetchPurchases();
      } else {
        alert("Failed to delete purchase bill");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting purchase bill");
    } finally {
      setDeleting(false);
    }
  }

  async function handleToggleVerify(billId: string) {
    try {
      const res = await fetch(`/api/admin/purchases/${billId}/verify`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setPurchases((prev) =>
          prev.map((b) => (b.id === billId ? { ...b, verifiedByAccountant: data.verified ? 1 : 0 } : b))
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreateVendor(e: React.FormEvent) {
    e.preventDefault();
    setSavingVendor(true);
    try {
      const res = await fetch("/api/admin/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newVendorName,
          phone: newVendorPhone,
          gstin: newVendorGstin,
          category: newVendorCategory,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setVendorModalOpen(false);
        setNewVendorName("");
        setNewVendorPhone("");
        setNewVendorGstin("");
        fetchVendors();
        if (data.vendorId) setSelectedVendorId(data.vendorId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingVendor(false);
    }
  }

  const numTaxable = Number(taxableValue) || 0;
  const numGst = Math.round(numTaxable * (gstRate / 100));
  const numTotal = Math.round(numTaxable + numGst);

  const editNumTaxable = Number(editTaxableValue) || 0;
  const editNumGst = Math.round(editNumTaxable * (editGstRate / 100));
  const editNumTotal = Math.round(editNumTaxable + editNumGst);

  const filteredPurchases = purchases.filter((p) => {
    const matchesSearch =
      p.vendorName.toLowerCase().includes(search.toLowerCase()) ||
      p.vendorInvoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      (p.orderNumber && p.orderNumber.toLowerCase().includes(search.toLowerCase())) ||
      (p.vendorGstin && p.vendorGstin.toLowerCase().includes(search.toLowerCase()));

    const matchesFilter =
      verificationFilter === "ALL" ||
      (verificationFilter === "VERIFIED" && p.verifiedByAccountant === 1) ||
      (verificationFilter === "PENDING" && p.verifiedByAccountant === 0);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShoppingCart className="w-6 h-6 text-purple-400" />
            Site Purchasing & Material Bill Uploads
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Table view of vendor bills, phone camera receipts, material categories, and Input Tax Credit (ITC) verification.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5">
          <button
            suppressHydrationWarning
            onClick={() => fetchPurchases()}
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 shadow-xs transition cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            suppressHydrationWarning
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs shadow-lg shadow-purple-500/20 transition cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            Snap & Upload Bill
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            suppressHydrationWarning
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by vendor, bill no, category, site..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { val: "ALL", label: "All Bills" },
            { val: "VERIFIED", label: "Verified for ITC" },
            { val: "PENDING", label: "Pending Verification" },
          ].map((opt) => (
            <button
              suppressHydrationWarning
              key={opt.val}
              onClick={() => setVerificationFilter(opt.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                verificationFilter === opt.val
                  ? "bg-purple-500 text-slate-950"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Purchases Table */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
          Loading purchase records...
        </div>
      ) : filteredPurchases.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200/90 p-8 shadow-xs">
          <ShoppingCart className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <div className="text-sm font-bold text-slate-800">No purchase bills recorded</div>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Click &quot;Snap & Upload Bill&quot; on your phone or computer to log materials purchased for any site.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-600 uppercase tracking-wider border-b border-slate-200 font-bold text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 w-28">Bill Date</th>
                  <th className="py-3.5 px-4">Vendor & GSTIN</th>
                  <th className="py-3.5 px-3 w-32">Bill #</th>
                  <th className="py-3.5 px-3 w-36">Category</th>
                  <th className="py-3.5 px-3">Project / Site</th>
                  <th className="py-3.5 px-3 w-28 text-right">Taxable</th>
                  <th className="py-3.5 px-3 w-28 text-right">GST (ITC)</th>
                  <th className="py-3.5 px-3 w-32 text-right">Total Amount</th>
                  <th className="py-3.5 px-3 w-28 text-center">ITC Status</th>
                  <th className="py-3.5 px-4 w-36 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPurchases.map((bill) => {
                  const hasAttachment = bill.attachments.length > 0;
                  const isVerified = bill.verifiedByAccountant === 1;

                  return (
                    <tr key={bill.id} className="hover:bg-slate-50 transition group">
                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {bill.billDate ? new Date(bill.billDate).toLocaleDateString() : "-"}
                      </td>

                      {/* Vendor & GSTIN */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 text-sm">{bill.vendorName}</div>
                        {bill.vendorGstin && (
                          <div className="text-[10px] text-purple-400 font-mono mt-0.5">
                            GSTIN: {bill.vendorGstin}
                          </div>
                        )}
                        {bill.vendorPhone && (
                          <div className="text-slate-500 text-[10px]">{bill.vendorPhone}</div>
                        )}
                      </td>

                      {/* Bill Number */}
                      <td className="py-3.5 px-3 font-mono text-slate-800 font-semibold whitespace-nowrap">
                        {bill.vendorInvoiceNumber}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {bill.category}
                        </span>
                      </td>

                      {/* Project / Site */}
                      <td className="py-3.5 px-3">
                        {bill.orderNumber ? (
                          <span className="font-mono text-amber-400/90 font-medium">
                            {bill.orderNumber}
                          </span>
                        ) : (
                          <span className="text-slate-500">General Overhead</span>
                        )}
                      </td>

                      {/* Taxable */}
                      <td className="py-3.5 px-3 text-right font-semibold text-slate-800">
                        ₹{bill.taxableAmount.toLocaleString("en-IN")}
                      </td>

                      {/* GST / ITC */}
                      <td className="py-3.5 px-3 text-right text-purple-400 font-semibold">
                        ₹{Math.round(bill.cgstAmount + bill.sgstAmount + bill.igstAmount).toLocaleString("en-IN")}
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-3 text-right font-extrabold text-slate-900 text-sm">
                        ₹{bill.totalAmount.toLocaleString("en-IN")}
                      </td>

                      {/* ITC Status Toggle */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          suppressHydrationWarning
                          onClick={() => handleToggleVerify(bill.id)}
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border transition inline-flex items-center gap-1 cursor-pointer ${
                            isVerified
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}
                          title="Click to toggle accountant verification"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          {isVerified ? "Verified" : "Pending"}
                        </button>
                      </td>

                      {/* Actions: View Photo, Edit, Delete */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Photo View */}
                          {hasAttachment ? (
                            <button
                              suppressHydrationWarning
                              onClick={() => setViewImageModal(bill.attachments[0].fileUrl)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-400 transition cursor-pointer"
                              title="View Attached Bill Receipt"
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="p-1.5 text-slate-600" title="No photo uploaded">
                              <ImageIcon className="w-3.5 h-3.5 opacity-30" />
                            </span>
                          )}

                          {/* Edit Bill */}
                          <button
                            suppressHydrationWarning
                            onClick={() => openEditModal(bill)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                            title="Edit Purchase Bill"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                          </button>

                          {/* Delete Bill */}
                          <button
                            suppressHydrationWarning
                            onClick={() => openDeleteModal(bill)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition cursor-pointer"
                            title="Delete Purchase Bill"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EDIT PURCHASE BILL MODAL */}
      {/* ======================================================== */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-400" />
                Edit Purchase Bill: <span className="font-mono text-purple-400">{editInvoiceNumber}</span>
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
                  <label className="block text-xs font-semibold text-slate-700 font-semibold mb-1">Vendor *</label>
                  <select
                    suppressHydrationWarning
                    value={editVendorId}
                    onChange={(e) => setEditVendorId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none focus:border-purple-400"
                  >
                    {vendorsList.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-semibold mb-1">Bill / Invoice # *</label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    required
                    value={editInvoiceNumber}
                    onChange={(e) => setEditInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-semibold mb-1">Material Category</label>
                  <select
                    suppressHydrationWarning
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none focus:border-purple-400"
                  >
                    <option value="Cement & Aggregates">Cement & Aggregates</option>
                    <option value="TMT Steel Reinforcement">TMT Steel Reinforcement</option>
                    <option value="Ready Mix Concrete (RMC)">Ready Mix Concrete (RMC)</option>
                    <option value="Electrical & MEP Fixtures">Electrical & MEP Fixtures</option>
                    <option value="Plumbing & Sanitary">Plumbing & Sanitary</option>
                    <option value="Paints & Waterproofing">Paints & Waterproofing</option>
                    <option value="Machinery & Fuel / DG">Machinery & Fuel / DG</option>
                    <option value="Subcontractor & Labour Bills">Subcontractor & Labour Bills</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-semibold mb-1">Bill Date *</label>
                  <input
                    suppressHydrationWarning
                    type="date"
                    required
                    value={editBillDate}
                    onChange={(e) => setEditBillDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-semibold mb-1">Taxable Value (₹) *</label>
                  <input
                    suppressHydrationWarning
                    type="number"
                    required
                    value={editTaxableValue}
                    onChange={(e) => setEditTaxableValue(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-semibold mb-1">GST Rate (%)</label>
                  <select
                    suppressHydrationWarning
                    value={editGstRate}
                    onChange={(e) => setEditGstRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none focus:border-purple-400"
                  >
                    <option value={18}>18% (Standard GST)</option>
                    <option value={28}>28% (Cement / Luxury)</option>
                    <option value={12}>12%</option>
                    <option value={5}>5%</option>
                    <option value={0}>0%</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Input Tax Credit (ITC):</span>
                  <span className="font-semibold text-purple-400">₹{editNumGst.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold pt-1 border-t border-slate-200">
                  <span>Total Calculated Amount:</span>
                  <span className="text-amber-400 font-extrabold text-sm">₹{editNumTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 font-semibold mb-1">Notes / Site Remarks</label>
                <input
                  suppressHydrationWarning
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none focus:border-purple-400"
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
      {/* DELETE PURCHASE BILL MODAL */}
      {/* ======================================================== */}
      {deleteModalOpen && billToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Delete Purchase Bill</h3>
                <p className="text-xs text-slate-400">Erases receipt and attached photo file.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Are you sure you want to delete bill <span className="font-mono font-bold text-purple-400">#{billToDelete.vendorInvoiceNumber}</span> from <span className="font-extrabold text-slate-900">{billToDelete.vendorName}</span>?
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
                {deleting ? "Deleting..." : "Yes, Delete Bill"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CREATE BILL MODAL */}
      {/* ======================================================== */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-purple-400" />
                  Upload Site Purchase Bill & Receipt
                </h2>
                <p className="text-xs text-slate-400">
                  Take a photo on mobile or upload invoice PDF/image.
                </p>
              </div>
              <button
                suppressHydrationWarning
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePurchase} className="space-y-4">
              {/* Photo Upload Box */}
              <div className="p-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-purple-500 bg-slate-50 text-center transition">
                {previewUrl ? (
                  <div className="relative inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Bill Preview"
                      className="max-h-48 rounded-lg shadow-lg mx-auto"
                    />
                    <button
                      suppressHydrationWarning
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="absolute -top-2 -right-2 p-1 rounded-full bg-rose-600 text-white hover:bg-rose-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Camera className="w-10 h-10 text-purple-400 mx-auto mb-2" />
                    <div className="text-xs font-semibold text-slate-900">
                      Snap Photo with Camera or Browse Image
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Supports JPG, PNG, WEBP, or PDF
                    </p>
                    <label className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 font-semibold text-xs transition cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      Choose File
                      <input
                        suppressHydrationWarning
                        type="file"
                        accept="image/*,application/pdf"
                        capture="environment"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Vendor & Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">Supplier / Vendor *</label>
                    <button
                      suppressHydrationWarning
                      type="button"
                      onClick={() => setVendorModalOpen(true)}
                      className="text-[10px] text-purple-400 hover:underline"
                    >
                      + New Vendor
                    </button>
                  </div>
                  <select
                    suppressHydrationWarning
                    value={selectedVendorId}
                    onChange={(e) => setSelectedVendorId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none focus:border-purple-400"
                  >
                    {vendorsList.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} {v.gstin ? `(GSTIN: ${v.gstin})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-semibold mb-1">
                    Allocate to Project / Work Order
                  </label>
                  <select
                    suppressHydrationWarning
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none focus:border-purple-400"
                  >
                    <option value="">General Overhead (Not project-specific)</option>
                    {ordersList.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.orderNumber} — {o.clientName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category & Invoice Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-semibold mb-1">
                    Material / Expense Category *
                  </label>
                  <select
                    suppressHydrationWarning
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none focus:border-purple-400"
                  >
                    <option value="Cement & Aggregates">Cement & Aggregates</option>
                    <option value="TMT Steel Reinforcement">TMT Steel Reinforcement</option>
                    <option value="Ready Mix Concrete (RMC)">Ready Mix Concrete (RMC)</option>
                    <option value="Electrical & MEP Fixtures">Electrical & MEP Fixtures</option>
                    <option value="Plumbing & Sanitary">Plumbing & Sanitary</option>
                    <option value="Paints & Waterproofing">Paints & Waterproofing</option>
                    <option value="Machinery & Fuel / DG">Machinery & Fuel / DG</option>
                    <option value="Subcontractor & Labour Bills">Subcontractor & Labour Bills</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-semibold mb-1">
                    Vendor Bill / Receipt # *
                  </label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    required
                    value={vendorInvoiceNumber}
                    onChange={(e) => setVendorInvoiceNumber(e.target.value)}
                    placeholder="e.g. INV-9844"
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              {/* Taxable Value & GST Rate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-semibold mb-1">
                    Taxable Amount (₹) *
                  </label>
                  <input
                    suppressHydrationWarning
                    type="number"
                    required
                    value={taxableValue}
                    onChange={(e) => setTaxableValue(e.target.value)}
                    placeholder="e.g. 85000"
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 font-semibold mb-1">
                    GST Rate Applied (%)
                  </label>
                  <select
                    suppressHydrationWarning
                    value={gstRate}
                    onChange={(e) => setGstRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none focus:border-purple-400"
                  >
                    <option value={18}>18% (Standard GST)</option>
                    <option value={28}>28% (Cement / Luxury)</option>
                    <option value={12}>12%</option>
                    <option value={5}>5%</option>
                    <option value={0}>0%</option>
                  </select>
                </div>
              </div>

              {/* Bill Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 font-semibold mb-1">Bill Date *</label>
                <input
                  suppressHydrationWarning
                  type="date"
                  required
                  value={billDate}
                  onChange={(e) => setBillDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* Financial Summary */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Taxable:</span>
                  <span className="font-semibold text-slate-900">₹{numTaxable.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Input GST Credit (ITC):</span>
                  <span className="font-semibold text-purple-400">₹{numGst.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold pt-1.5 border-t border-slate-200 text-sm">
                  <span>Grand Total Bill Amount:</span>
                  <span className="text-amber-400 font-extrabold">₹{numTotal.toLocaleString("en-IN")}</span>
                </div>
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
                  className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs shadow-lg shadow-purple-500/20 cursor-pointer disabled:opacity-50"
                >
                  {creating ? "Uploading..." : "Save Bill Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* QUICK ADD VENDOR MODAL */}
      {/* ======================================================== */}
      {vendorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-purple-400" />
                Add New Supplier / Vendor
              </h2>
              <button
                suppressHydrationWarning
                onClick={() => setVendorModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVendor} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 font-semibold mb-1">
                  Vendor Name *
                </label>
                <input
                  suppressHydrationWarning
                  type="text"
                  required
                  value={newVendorName}
                  onChange={(e) => setNewVendorName(e.target.value)}
                  placeholder="e.g. UltraTech Cement Agency"
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 font-semibold mb-1">
                  Phone Number
                </label>
                <input
                  suppressHydrationWarning
                  type="tel"
                  value={newVendorPhone}
                  onChange={(e) => setNewVendorPhone(e.target.value)}
                  placeholder="e.g. +91 94440 55555"
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 font-semibold mb-1">
                  Vendor GSTIN (Required for ITC Claim)
                </label>
                <input
                  suppressHydrationWarning
                  type="text"
                  value={newVendorGstin}
                  onChange={(e) => setNewVendorGstin(e.target.value)}
                  placeholder="e.g. 33ABCDE1234F1Z5"
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 font-semibold mb-1">
                  Supply Category
                </label>
                <select
                  suppressHydrationWarning
                  value={newVendorCategory}
                  onChange={(e) => setNewVendorCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none focus:border-purple-400"
                >
                  <option value="Cement & Aggregates">Cement & Aggregates</option>
                  <option value="TMT Steel Reinforcement">TMT Steel Reinforcement</option>
                  <option value="Ready Mix Concrete (RMC)">Ready Mix Concrete (RMC)</option>
                  <option value="Electrical & MEP Fixtures">Electrical & MEP Fixtures</option>
                  <option value="Plumbing & Sanitary">Plumbing & Sanitary</option>
                  <option value="Paints & Waterproofing">Paints & Waterproofing</option>
                  <option value="Machinery & Fuel / DG">Machinery & Fuel / DG</option>
                  <option value="Subcontractor & Labour Bills">Subcontractor & Labour Bills</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => setVendorModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  suppressHydrationWarning
                  type="submit"
                  disabled={savingVendor}
                  className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs shadow-lg shadow-purple-500/20 cursor-pointer disabled:opacity-50"
                >
                  {savingVendor ? "Saving..." : "Save Vendor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* BILL RECEIPT IMAGE VIEWER MODAL */}
      {/* ======================================================== */}
      {viewImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-3xl max-h-[90vh] bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 shadow-2xl overflow-hidden flex flex-col items-center">
            <button
              suppressHydrationWarning
              onClick={() => setViewImageModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="overflow-auto max-h-[80vh] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={viewImageModal}
                alt="Receipt Full Preview"
                className="rounded-lg object-contain max-h-[75vh]"
              />
            </div>
            <div className="mt-3">
              <a
                href={viewImageModal}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-purple-300 font-semibold"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open Full Resolution in New Tab
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
