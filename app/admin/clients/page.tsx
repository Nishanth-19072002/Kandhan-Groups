"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Building,
  Phone,
  Mail,
  MapPin,
  Plus,
  Search,
  Eye,
  Edit3,
  Trash2,
  X,
  FileSpreadsheet,
  FileCheck2,
  Receipt,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

interface ClientItem {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  companyName: string | null;
  gstin: string | null;
  billingAddress: string | null;
  siteAddress: string | null;
  createdAt: string;
  totalEnquiries: number;
  totalQuotations: number;
  totalWorkOrders: number;
  totalPipelineValue: number;
}

export default function ClientsPage() {
  const [clientsList, setClientsList] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Create Client Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    phone: "",
    email: "",
    companyName: "",
    gstin: "",
    billingAddress: "",
    siteAddress: "",
  });

  // Edit Client Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    email: "",
    companyName: "",
    gstin: "",
    billingAddress: "",
    siteAddress: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<ClientItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // View Client 360° Profile Modal State
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedClientProfile, setSelectedClientProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState<"overview" | "enquiries" | "quotes" | "orders" | "invoices">("overview");

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/clients");
      const data = await res.json();
      if (res.ok && data.clients) {
        setClientsList(data.clients);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Open 360° Profile
  async function openClientProfile(clientId: string) {
    setViewModalOpen(true);
    setLoadingProfile(true);
    setActiveProfileTab("overview");
    try {
      const res = await fetch(`/api/admin/clients/${clientId}`);
      const data = await res.json();
      if (res.ok) {
        setSelectedClientProfile(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProfile(false);
    }
  }

  // Create Client Submit
  async function handleCreateClient(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to create client");
        return;
      }
      setCreateModalOpen(false);
      setCreateForm({
        name: "",
        phone: "",
        email: "",
        companyName: "",
        gstin: "",
        billingAddress: "",
        siteAddress: "",
      });
      await fetchClients();
    } catch (err) {
      console.error(err);
      alert("Error saving client profile.");
    } finally {
      setCreating(false);
    }
  }

  // Edit Client Submit
  function openEditModal(c: ClientItem) {
    setEditingId(c.id);
    setEditForm({
      name: c.name,
      phone: c.phone,
      email: c.email || "",
      companyName: c.companyName || "",
      gstin: c.gstin || "",
      billingAddress: c.billingAddress || "",
      siteAddress: c.siteAddress || "",
    });
    setEditModalOpen(true);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/clients/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update client");
        return;
      }
      setEditModalOpen(false);
      setEditingId(null);
      await fetchClients();
    } catch (err) {
      console.error(err);
      alert("Error updating client profile.");
    } finally {
      setSavingEdit(false);
    }
  }

  // Delete Client Submit
  async function handleDeleteClient() {
    if (!clientToDelete) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/admin/clients/${clientToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error || "Failed to delete client");
        return;
      }
      setDeleteModalOpen(false);
      setClientToDelete(null);
      await fetchClients();
    } catch (err: unknown) {
      console.error(err);
      setDeleteError("Network or server connection error.");
    } finally {
      setDeleting(false);
    }
  }

  const filteredClients = clientsList.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.companyName && c.companyName.toLowerCase().includes(q)) ||
      (c.gstin && c.gstin.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-amber-500" />
            Client Directory & Customer Profiles
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Central repository of all prospective, corporate, and mill clients. View complete 360° enquiry, quotation, and project histories.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5">
          <button
            suppressHydrationWarning
            onClick={() => fetchClients()}
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 shadow-xs transition cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            suppressHydrationWarning
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Client
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            suppressHydrationWarning
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client name, company, phone, GSTIN..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <div className="text-xs text-slate-600 font-semibold">
          Total Registered Clients: <span className="font-extrabold text-slate-900">{clientsList.length}</span>
        </div>
      </div>

      {/* Clients Table */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
          Loading client profiles...
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200/90 p-8 shadow-xs">
          <Users className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <div className="text-sm font-bold text-slate-800">No client profiles found</div>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {search ? "No clients match your search query." : "Click 'Add New Client' to register your first client profile."}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 uppercase tracking-wider border-b border-slate-200 font-bold text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Client Name & Company</th>
                  <th className="py-3.5 px-3">Contact Details</th>
                  <th className="py-3.5 px-3">GSTIN</th>
                  <th className="py-3.5 px-3 text-center">Enquiries</th>
                  <th className="py-3.5 px-3 text-center">Quotations</th>
                  <th className="py-3.5 px-3 text-center">Projects</th>
                  <th className="py-3.5 px-3 text-right">Pipeline Value</th>
                  <th className="py-3.5 px-4 text-right w-36">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition group">
                    {/* Name & Company */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center font-extrabold text-amber-800 text-xs">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-sm">{c.name}</div>
                          {c.companyName && (
                            <div className="text-[11px] text-amber-700 font-semibold flex items-center gap-1 mt-0.5">
                              <Building className="w-3 h-3 text-amber-600 shrink-0" />
                              <span className="truncate max-w-xs">{c.companyName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact Phone & Email */}
                    <td className="py-3.5 px-3">
                      <div className="text-slate-800 font-semibold flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {c.phone}
                      </div>
                      {c.email && (
                        <div className="text-slate-500 text-[11px] flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-xs">{c.email}</span>
                        </div>
                      )}
                    </td>

                    {/* GSTIN */}
                    <td className="py-3.5 px-3">
                      {c.gstin ? (
                        <span className="font-mono text-[11px] text-slate-800 font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {c.gstin}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Unregistered</span>
                      )}
                    </td>

                    {/* Enquiries Count */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {c.totalEnquiries}
                      </span>
                    </td>

                    {/* Quotations Count */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {c.totalQuotations}
                      </span>
                    </td>

                    {/* Active Work Orders */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {c.totalWorkOrders}
                      </span>
                    </td>

                    {/* Pipeline Value */}
                    <td className="py-3.5 px-3 text-right font-extrabold text-slate-900">
                      ₹{c.totalPipelineValue.toLocaleString("en-IN")}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* New Enquiry for this Client */}
                        <Link
                          href={`/admin/enquiries?clientId=${c.id}`}
                          className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition cursor-pointer"
                          title="Add New Project Enquiry for this Client"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </Link>

                        {/* 360 Profile */}
                        <button
                          suppressHydrationWarning
                          onClick={() => openClientProfile(c.id)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                          title="View Complete 360° Client History"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-600" />
                        </button>

                        {/* Edit */}
                        <button
                          suppressHydrationWarning
                          onClick={() => openEditModal(c)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                          title="Edit Client Information"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                        </button>

                        {/* Delete */}
                        <button
                          suppressHydrationWarning
                          onClick={() => {
                            setClientToDelete(c);
                            setDeleteError("");
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition cursor-pointer"
                          title="Delete Client Record"
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
      {/* 1. VIEW CLIENT 360° PROFILE MODAL */}
      {/* ======================================================== */}
      {viewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-900 max-h-[90vh] overflow-y-auto">
            {loadingProfile || !selectedClientProfile ? (
              <div className="text-center py-20 text-slate-500 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                Loading client profile...
              </div>
            ) : (
              <div className="space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center font-extrabold text-amber-800 text-base">
                      {selectedClientProfile.client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-900">{selectedClientProfile.client.name}</h2>
                      <div className="text-xs text-amber-700 font-bold flex items-center gap-1.5 mt-0.5">
                        <Building className="w-3.5 h-3.5" />
                        {selectedClientProfile.client.companyName || "Direct Individual Client"}
                      </div>
                    </div>
                  </div>
                  <button
                    suppressHydrationWarning
                    onClick={() => setViewModalOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Contact Card Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Phone Number</span>
                    <span className="font-extrabold text-slate-900 mt-0.5 block">{selectedClientProfile.client.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Email Address</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block truncate">
                      {selectedClientProfile.client.email || "Not Provided"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Client GSTIN</span>
                    <span className="font-mono font-bold text-slate-900 mt-0.5 block">
                      {selectedClientProfile.client.gstin || "Unregistered"}
                    </span>
                  </div>
                </div>

                {/* Sub-Tabs Navigation */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
                  {[
                    { id: "overview", label: "Overview & Addresses" },
                    { id: "enquiries", label: `Enquiries (${selectedClientProfile.enquiries.length})` },
                    { id: "quotes", label: `Quotations (${selectedClientProfile.quotations.length})` },
                    { id: "orders", label: `Work Orders (${selectedClientProfile.orders.length})` },
                    { id: "invoices", label: `Tax Invoices (${selectedClientProfile.invoices.length})` },
                  ].map((t) => (
                    <button
                      suppressHydrationWarning
                      key={t.id}
                      onClick={() => setActiveProfileTab(t.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                        activeProfileTab === t.id
                          ? "bg-slate-900 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Tab: Overview */}
                {activeProfileTab === "overview" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-xs">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-amber-500" />
                        Registered Billing Address
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        {selectedClientProfile.client.billingAddress || "No separate billing address recorded."}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-xs">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        Default Construction Site Location
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        {selectedClientProfile.client.siteAddress || "Site location specified per project."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab: Enquiries */}
                {activeProfileTab === "enquiries" && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Project Enquiries & Site Requests ({selectedClientProfile.enquiries.length})
                      </span>
                      <Link
                        href={`/admin/enquiries?clientId=${selectedClientProfile.client.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition"
                      >
                        <Plus className="w-3.5 h-3.5" /> + New Enquiry
                      </Link>
                    </div>

                    {selectedClientProfile.enquiries.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 text-xs">No enquiries recorded for this client.</div>
                    ) : (
                      selectedClientProfile.enquiries.map((e: any) => (
                        <div key={e.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-extrabold text-slate-900">{e.workType}</div>
                            <div className="text-slate-500 text-[11px] mt-0.5">{e.siteLocation}</div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[10px]">
                              {e.status}
                            </span>
                            <div className="text-[11px] text-slate-600 font-semibold mt-1">
                              {e.estimatedBudget ? `Budget: ₹${e.estimatedBudget.toLocaleString("en-IN")}` : "Flexible"}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Tab: Quotations */}
                {activeProfileTab === "quotes" && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Quotation Estimates & Revisions ({selectedClientProfile.quotations.length})
                      </span>
                      <Link
                        href={`/admin/quotations?clientId=${selectedClientProfile.client.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition"
                      >
                        <Plus className="w-3.5 h-3.5" /> + New Quotation
                      </Link>
                    </div>

                    {selectedClientProfile.quotations.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 text-xs">No quotations created for this client.</div>
                    ) : (
                      selectedClientProfile.quotations.map((q: any) => (
                        <div key={q.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-mono font-bold text-slate-900">{q.quoteNumber} (Rev {q.currentRevision})</div>
                            <div className="text-slate-500 text-[11px] mt-0.5">Status: {q.status}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-black text-amber-600 text-sm">₹{q.grandTotal.toLocaleString("en-IN")}</div>
                            <Link
                              href="/admin/quotations"
                              className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 mt-0.5 justify-end"
                            >
                              Open in Engine <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Tab: Orders */}
                {activeProfileTab === "orders" && (
                  <div className="space-y-2">
                    {selectedClientProfile.orders.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 text-xs">No active or confirmed work orders yet.</div>
                    ) : (
                      selectedClientProfile.orders.map((o: any) => (
                        <div key={o.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-mono font-bold text-emerald-800">{o.orderNumber}</div>
                            <div className="text-slate-500 text-[11px] mt-0.5">Start: {o.startDate} | Status: {o.status}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-black text-slate-900 text-sm">₹{o.agreedContractValue.toLocaleString("en-IN")}</div>
                            <div className="text-[11px] text-emerald-700 font-semibold">Advance: ₹{o.advanceAgreed.toLocaleString("en-IN")}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Tab: Invoices */}
                {activeProfileTab === "invoices" && (
                  <div className="space-y-2">
                    {selectedClientProfile.invoices.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 text-xs">No sales invoices issued for this client.</div>
                    ) : (
                      selectedClientProfile.invoices.map((inv: any) => (
                        <div key={inv.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-mono font-bold text-cyan-800">{inv.invoiceNumber}</div>
                            <div className="text-slate-500 text-[11px] mt-0.5">Date: {inv.invoiceDate} • Status: {inv.paymentStatus}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-black text-slate-900 text-sm">₹{inv.totalInvoiceAmount.toLocaleString("en-IN")}</div>
                            <div className="text-[11px] text-rose-600 font-bold">Balance: ₹{inv.balanceAmount.toLocaleString("en-IN")}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. CREATE CLIENT MODAL */}
      {/* ======================================================== */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-900">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                Add New Client Profile
              </h2>
              <button
                suppressHydrationWarning
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Client Name *
                  </label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    required
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="e.g. S. Murugan"
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Phone *
                  </label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    required
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder="+91 98410 99887"
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Company / Firm Name
                  </label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={createForm.companyName}
                    onChange={(e) => setCreateForm({ ...createForm, companyName: e.target.value })}
                    placeholder="e.g. Murugan Spinning Mills Pvt Ltd"
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Client GSTIN
                  </label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={createForm.gstin}
                    onChange={(e) => setCreateForm({ ...createForm, gstin: e.target.value })}
                    placeholder="33AAAAA0000A1Z5"
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs uppercase font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  suppressHydrationWarning
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="contact@murugantextiles.com"
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Billing Address
                </label>
                <textarea
                  suppressHydrationWarning
                  rows={2}
                  value={createForm.billingAddress}
                  onChange={(e) => setCreateForm({ ...createForm, billingAddress: e.target.value })}
                  placeholder="Official registered company / GST address..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  suppressHydrationWarning
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  {creating ? "Saving..." : "Save Client Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. EDIT CLIENT MODAL */}
      {/* ======================================================== */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-900">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                Edit Client Profile
              </h2>
              <button
                suppressHydrationWarning
                onClick={() => setEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Client Name *
                  </label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Phone *
                  </label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Company / Firm Name
                  </label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={editForm.companyName}
                    onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Client GSTIN
                  </label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={editForm.gstin}
                    onChange={(e) => setEditForm({ ...editForm, gstin: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs uppercase font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  suppressHydrationWarning
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Billing Address
                </label>
                <textarea
                  suppressHydrationWarning
                  rows={2}
                  value={editForm.billingAddress}
                  onChange={(e) => setEditForm({ ...editForm, billingAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  suppressHydrationWarning
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
                >
                  {savingEdit ? "Saving..." : "Update Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. DELETE CLIENT MODAL */}
      {/* ======================================================== */}
      {deleteModalOpen && clientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-900">
            <h2 className="text-base font-extrabold text-slate-900 mb-2">Delete Client Record?</h2>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Are you sure you want to permanently delete <span className="font-extrabold text-slate-900">{clientToDelete.name}</span> ({clientToDelete.companyName || "Direct"})? Clients with active ongoing Work Orders or recorded Tax Invoices cannot be deleted.
            </p>

            {deleteError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                ⚠️ {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                suppressHydrationWarning
                onClick={handleDeleteClient}
                disabled={deleting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 cursor-pointer disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Delete Client"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

