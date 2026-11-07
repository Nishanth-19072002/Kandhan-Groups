"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  MessageSquare,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  Building,
  Edit3,
  Trash2,
  Eye,
  RefreshCw,
  AlertTriangle,
  Contact,
} from "lucide-react";

interface EnquiryItem {
  id: string;
  workType: string;
  siteLocation: string;
  description: string | null;
  estimatedBudget?: number | null;
  status: string;
  createdAt: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
  companyName: string | null;
  gstin: string | null;
  billingAddress: string | null;
  followupCount?: number;
}

interface FollowupItem {
  id: string;
  channel: string;
  notes: string;
  followupDate: string;
  nextReminderDate: string | null;
  createdAt: string;
  userName: string;
  userRole: string;
}

const statusOptions = [
  { val: "NEW", label: "New Lead", color: "bg-amber-50 text-amber-800 border-amber-200" },
  { val: "CONTACTED", label: "Contacted", color: "bg-blue-50 text-blue-800 border-blue-200" },
  { val: "SITE_VISIT_SCHEDULED", label: "Site Visit Scheduled", color: "bg-purple-50 text-purple-800 border-purple-200" },
  { val: "SITE_VISITED", label: "Site Visited", color: "bg-indigo-50 text-indigo-800 border-indigo-200" },
  { val: "QUOTATION_SENT", label: "Quotation Sent", color: "bg-cyan-50 text-cyan-800 border-cyan-200" },
  { val: "CONFIRMED", label: "Confirmed Order", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  { val: "LOST", label: "Closed / Lost", color: "bg-rose-50 text-rose-800 border-rose-200" },
];

export default function EnquiriesPage() {
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("clientId");

  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Client Selection Mode for New Enquiry
  const [clientMode, setClientMode] = useState<"EXISTING" | "NEW">("EXISTING");
  const [selectedClientId, setSelectedClientId] = useState(preselectedClientId || "");

  // New Lead Modal
  const [createModalOpen, setCreateModalOpen] = useState(!!preselectedClientId);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    companyName: "",
    gstin: "",
    workType: "Industrial & Factory Civil Works",
    siteLocation: "",
    description: "",
    followupChannel: "PHONE_CALL",
    nextReminderDate: "",
    followupNotes: "",
  });

  // Edit Lead Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    phone: "",
    email: "",
    companyName: "",
    gstin: "",
    workType: "",
    siteLocation: "",
    description: "",
    status: "NEW",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Lead Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [enquiryToDelete, setEnquiryToDelete] = useState<EnquiryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Follow-ups inside Edit Modal
  const [modalFollowups, setModalFollowups] = useState<FollowupItem[]>([]);
  const [loadingModalFollowups, setLoadingModalFollowups] = useState(false);
  const [modalNote, setModalNote] = useState("");
  const [modalChannel, setModalChannel] = useState("PHONE_CALL");
  const [modalNextReminder, setModalNextReminder] = useState("");
  const [savingModalNote, setSavingModalNote] = useState(false);

  // Followups Drawer (Outside)
  const [activeEnquiry, setActiveEnquiry] = useState<EnquiryItem | null>(null);
  const [followups, setFollowups] = useState<FollowupItem[]>([]);
  const [loadingFollowups, setLoadingFollowups] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [newChannel, setNewChannel] = useState("PHONE_CALL");
  const [nextReminder, setNextReminder] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    fetchEnquiries();
    fetchClients();
  }, []);

  useEffect(() => {
    if (preselectedClientId) {
      setSelectedClientId(preselectedClientId);
      setClientMode("EXISTING");
      setCreateModalOpen(true);
    }
  }, [preselectedClientId]);

  async function fetchClients() {
    try {
      const res = await fetch("/api/admin/clients");
      const data = await res.json();
      if (res.ok && data.clients) {
        setClientsList(data.clients);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchEnquiries() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/enquiries");
      const data = await res.json();
      if (res.ok && data.enquiries) {
        setEnquiries(data.enquiries);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(enquiryId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/admin/enquiries/${enquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setEnquiries((prev) =>
          prev.map((e) => (e.id === enquiryId ? { ...e, status: newStatus } : e))
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCreateEnquiry(e: React.FormEvent) {
    e.preventDefault();

    if (clientMode === "EXISTING" && !selectedClientId) {
      alert("Please select a registered client from the dropdown list.");
      return;
    }

    setCreating(true);
    try {
      const payload =
        clientMode === "EXISTING"
          ? {
              clientId: selectedClientId,
              workType: formData.workType,
              siteLocation: formData.siteLocation,
              description: formData.description,
              followupChannel: formData.followupChannel,
              nextReminderDate: formData.nextReminderDate || null,
              followupNotes: formData.followupNotes,
            }
          : formData;

      const res = await fetch("/api/admin/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to create enquiry");
        return;
      }

      setCreateModalOpen(false);
      setFormData({
        name: "",
        phone: "",
        email: "",
        companyName: "",
        gstin: "",
        workType: "Industrial & Factory Civil Works",
        siteLocation: "",
        description: "",
        followupChannel: "PHONE_CALL",
        nextReminderDate: "",
        followupNotes: "",
      });
      await fetchEnquiries();
      await fetchClients();
    } catch (err: unknown) {
      console.error(err);
      alert("Network error creating enquiry.");
    } finally {
      setCreating(false);
    }
  }

  async function fetchModalFollowups(enquiryId: string) {
    setLoadingModalFollowups(true);
    try {
      const res = await fetch(`/api/admin/enquiries/${enquiryId}/followups`);
      const data = await res.json();
      if (res.ok && data.followups) {
        setModalFollowups(data.followups);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingModalFollowups(false);
    }
  }

  async function handleAddModalFollowup(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId || !modalNote.trim()) return;
    setSavingModalNote(true);
    try {
      const res = await fetch(`/api/admin/enquiries/${editingId}/followups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: modalChannel,
          notes: modalNote,
          nextReminderDate: modalNextReminder || null,
        }),
      });
      if (res.ok) {
        setModalNote("");
        setModalNextReminder("");
        await fetchModalFollowups(editingId);
        await fetchEnquiries();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingModalNote(false);
    }
  }

  function openEditModal(enq: EnquiryItem) {
    setEditingId(enq.id);
    setEditFormData({
      name: enq.clientName || "",
      phone: enq.clientPhone || "",
      email: enq.clientEmail || "",
      companyName: enq.companyName || "",
      gstin: enq.gstin || "",
      workType: enq.workType || "Industrial & Factory Civil Works",
      siteLocation: enq.siteLocation || "",
      description: enq.description || "",
      status: enq.status || "NEW",
    });
    setModalNote("");
    setModalNextReminder("");
    fetchModalFollowups(enq.id);
    setEditModalOpen(true);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setSavingEdit(true);

    try {
      const res = await fetch(`/api/admin/enquiries/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });

      if (res.ok) {
        setEditModalOpen(false);
        setEditingId(null);
        fetchEnquiries();
      } else {
        alert("Failed to update enquiry");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving enquiry");
    } finally {
      setSavingEdit(false);
    }
  }

  function openDeleteModal(enq: EnquiryItem) {
    setEnquiryToDelete(enq);
    setDeleteModalOpen(true);
  }

  async function handleConfirmDelete() {
    if (!enquiryToDelete) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/enquiries/${enquiryToDelete.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDeleteModalOpen(false);
        setEnquiryToDelete(null);
        fetchEnquiries();
      } else {
        alert("Failed to delete enquiry");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting enquiry");
    } finally {
      setDeleting(false);
    }
  }

  async function openFollowups(enq: EnquiryItem) {
    setActiveEnquiry(enq);
    setLoadingFollowups(true);
    try {
      const res = await fetch(`/api/admin/enquiries/${enq.id}/followups`);
      const data = await res.json();
      if (res.ok && data.followups) {
        setFollowups(data.followups);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFollowups(false);
    }
  }

  async function handleAddFollowup(e: React.FormEvent) {
    e.preventDefault();
    if (!activeEnquiry || !newNote.trim()) return;
    setSavingNote(true);

    try {
      const res = await fetch(`/api/admin/enquiries/${activeEnquiry.id}/followups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: newChannel,
          notes: newNote,
          nextReminderDate: nextReminder || null,
        }),
      });

      if (res.ok) {
        setNewNote("");
        setNextReminder("");
        openFollowups(activeEnquiry);
        fetchEnquiries();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNote(false);
    }
  }

  const filteredEnquiries = enquiries.filter((e) => {
    const matchesSearch =
      e.clientName.toLowerCase().includes(search.toLowerCase()) ||
      e.clientPhone.includes(search) ||
      e.siteLocation.toLowerCase().includes(search.toLowerCase()) ||
      e.workType.toLowerCase().includes(search.toLowerCase()) ||
      (e.companyName && e.companyName.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-amber-400" />
            Client Enquiries & Follow-up Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data table view of incoming leads, site requests, call logs, and quotation conversions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            suppressHydrationWarning
            onClick={() => fetchEnquiries()}
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 shadow-xs transition cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            suppressHydrationWarning
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Lead / Enquiry
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            suppressHydrationWarning
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client name, phone, site, company..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            suppressHydrationWarning
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              statusFilter === "ALL"
                ? "bg-amber-500 text-slate-950"
                : "bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({enquiries.length})
          </button>
          {statusOptions.map((opt) => {
            const count = enquiries.filter((e) => e.status === opt.val).length;
            return (
              <button
                suppressHydrationWarning
                key={opt.val}
                onClick={() => setStatusFilter(opt.val)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
                  statusFilter === opt.val
                    ? "bg-[#0B192C] text-white font-bold"
                    : "text-slate-400 hover:text-slate-900"
                }`}
              >
                {opt.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Enquiries Data Table */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
          Loading client pipeline...
        </div>
      ) : filteredEnquiries.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200/90 p-8 shadow-xs">
          <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <div className="text-sm font-bold text-slate-800">No matching enquiries found</div>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {search || statusFilter !== "ALL"
              ? "Try adjusting your search query or status filter."
              : "Capture your first walk-in lead or check website enquiries."}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-600 uppercase tracking-wider border-b border-slate-200 font-bold text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 w-28">Date</th>
                  <th className="py-3.5 px-4">Client & Contact</th>
                  <th className="py-3.5 px-4">Work Type & Site</th>
                  <th className="py-3.5 px-4">Remarks</th>
                  <th className="py-3.5 px-3 w-28 text-center">Follow-ups</th>
                  <th className="py-3.5 px-3 w-36 text-center">Pipeline Status</th>
                  <th className="py-3.5 px-4 w-40 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEnquiries.map((enq) => {
                  const statusConfig =
                    statusOptions.find((s) => s.val === enq.status) || statusOptions[0];

                  return (
                    <tr key={enq.id} className="hover:bg-slate-50 transition group">
                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {enq.createdAt ? new Date(enq.createdAt).toLocaleDateString() : "-"}
                      </td>

                      {/* Client & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 text-sm">{enq.clientName}</div>
                        {enq.companyName && (
                          <div className="text-[11px] text-amber-400/90 flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3 text-amber-400 shrink-0" />
                            <span className="truncate max-w-xs">{enq.companyName}</span>
                          </div>
                        )}
                        <div className="text-slate-400 text-xs flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-500" />
                            {enq.clientPhone}
                          </span>
                          {enq.clientEmail && (
                            <span className="text-slate-500 truncate max-w-xs">{enq.clientEmail}</span>
                          )}
                        </div>
                      </td>

                      {/* Work Type & Site */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{enq.workType}</div>
                        <div className="text-slate-500 flex items-center gap-1 mt-0.5 text-[11px]">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-xs">{enq.siteLocation}</span>
                        </div>
                      </td>

                      {/* Remarks */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {enq.description ? (
                          <div className="text-slate-700 text-xs italic truncate" title={enq.description}>
                            &quot;{enq.description}&quot;
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">No remarks recorded</span>
                        )}
                      </td>

                      {/* Follow-ups (Quick Management from Outside) */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          suppressHydrationWarning
                          onClick={() => openFollowups(enq)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition cursor-pointer"
                          title="Manage Follow-up Timeline & Call Logs"
                        >
                          <MessageSquare className="w-3 h-3 text-amber-600" />
                          <span>{enq.followupCount || 0} Notes</span>
                        </button>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-3 text-center">
                        <select
                          suppressHydrationWarning
                          value={enq.status}
                          onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border bg-white focus:outline-none cursor-pointer shadow-xs ${statusConfig.color}`}
                        >
                          {statusOptions.map((opt) => (
                            <option key={opt.val} value={opt.val} className="bg-white text-slate-900">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Actions: Followup, Edit, Quote, Delete */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Follow-up / Timeline Drawer */}
                          <button
                            suppressHydrationWarning
                            onClick={() => openFollowups(enq)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                            title="Call Logs & Timeline Drawer"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                          </button>

                          {/* Edit Lead */}
                          <button
                            suppressHydrationWarning
                            onClick={() => openEditModal(enq)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                            title="Edit Lead & Manage Follow-ups"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                          </button>

                          {/* Quick Create Quote */}
                          <Link
                            href={`/admin/quotations?enquiryId=${enq.id}`}
                            className="p-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 transition cursor-pointer"
                            title="Create Quotation"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
                          </Link>

                          {/* Delete Lead */}
                          <button
                            suppressHydrationWarning
                            onClick={() => openDeleteModal(enq)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition cursor-pointer"
                            title="Delete Lead"
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
      {/* EDIT ENQUIRY & FOLLOW-UPS MODAL */}
      {/* ======================================================== */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-blue-500" />
                  Edit Enquiry & Manage Follow-ups
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update enquiry specifications, site details, remarks, and log conversation follow-ups for this enquiry.
                </p>
              </div>
              <button
                suppressHydrationWarning
                onClick={() => setEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Part 1: Enquiry Details Form */}
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                1. Enquiry Details & Remarks
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Client Full Name *</label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    suppressHydrationWarning
                    type="tel"
                    required
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Firm Name</label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={editFormData.companyName}
                    onChange={(e) => setEditFormData({ ...editFormData, companyName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pipeline Status</label>
                  <select
                    suppressHydrationWarning
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.val} value={opt.val}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Work Type *</label>
                  <select
                    suppressHydrationWarning
                    value={editFormData.workType}
                    onChange={(e) => setEditFormData({ ...editFormData, workType: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Industrial & Factory Civil Works">Industrial & Factory Civil Works</option>
                    <option value="Commercial Complex Construction">Commercial Complex Construction</option>
                    <option value="Residential Turnkey House">Residential Turnkey House</option>
                    <option value="Project Management Consultancy (PMC)">Project Management Consultancy (PMC)</option>
                    <option value="Excavation & Earthmoving">Excavation & Earthmoving</option>
                    <option value="Architectural Planning & 3D Design">Architectural Planning & 3D Design</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Site Location *</label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    required
                    value={editFormData.siteLocation}
                    onChange={(e) => setEditFormData({ ...editFormData, siteLocation: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks</label>
                <textarea
                  suppressHydrationWarning
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  placeholder="Notes from call, land dimensions, structural requirements, client preferences..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  suppressHydrationWarning
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
                >
                  {savingEdit ? "Saving..." : "Save Enquiry Details"}
                </button>
              </div>
            </form>

            {/* Part 2: Inline Follow-ups & Activity Log for THIS enquiry */}
            <div className="mt-6 pt-5 border-t border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-amber-500" />
                    2. Follow-ups & Activity Log ({modalFollowups.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Log call notes, site visits, or WhatsApp interactions directly for this enquiry.
                  </p>
                </div>
              </div>

              {/* Add Followup Form */}
              <form onSubmit={handleAddModalFollowup} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Channel</label>
                    <select
                      suppressHydrationWarning
                      value={modalChannel}
                      onChange={(e) => setModalChannel(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 text-slate-900 rounded-lg text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="PHONE_CALL">Phone Call</option>
                      <option value="WHATSAPP">WhatsApp</option>
                      <option value="SITE_MEETING">Site Meeting</option>
                      <option value="OFFICE_VISIT">Office Visit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Next Followup Reminder (Optional)</label>
                    <input
                      suppressHydrationWarning
                      type="date"
                      value={modalNextReminder}
                      onChange={(e) => setModalNextReminder(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 text-slate-900 rounded-lg text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <textarea
                    suppressHydrationWarning
                    rows={2}
                    required
                    value={modalNote}
                    onChange={(e) => setModalNote(e.target.value)}
                    placeholder="Log summary of conversation, client response, site feedback..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-lg text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    suppressHydrationWarning
                    type="submit"
                    disabled={savingModalNote}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {savingModalNote ? "Adding Note..." : "Add Follow-up Note"}
                  </button>
                </div>
              </form>

              {/* Followups List for this enquiry */}
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {loadingModalFollowups ? (
                  <div className="text-center py-6 text-slate-500 text-xs">Loading follow-ups...</div>
                ) : modalFollowups.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs italic bg-slate-50/50 rounded-xl border border-slate-100">
                    No follow-ups recorded yet for this enquiry.
                  </div>
                ) : (
                  modalFollowups.map((f) => (
                    <div key={f.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {f.channel.replace("_", " ")}
                        </span>
                        <span className="text-slate-500 text-[10px]">{new Date(f.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-slate-800 pt-0.5 leading-relaxed">{f.notes}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-200/80">
                        <span>Logged by: {f.userName} ({f.userRole})</span>
                        {f.nextReminderDate && (
                          <span className="text-amber-700 font-bold">Reminder: {f.nextReminderDate}</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 mt-4 border-t border-slate-200">
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DELETE LEAD MODAL */}
      {/* ======================================================== */}
      {deleteModalOpen && enquiryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Delete Client Enquiry</h3>
                <p className="text-xs text-slate-400">All call history and notes will be removed.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Are you sure you want to delete the enquiry for{" "}
              <span className="font-extrabold text-slate-900">{enquiryToDelete.clientName}</span> ({enquiryToDelete.siteLocation})?
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
                {deleting ? "Deleting..." : "Yes, Delete Lead"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CREATE NEW LEAD MODAL */}
      {/* ======================================================== */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                Capture New Client Enquiry
              </h2>
              <button
                suppressHydrationWarning
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEnquiry} className="space-y-4">
              {/* Client Selection Toggle */}
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => setClientMode("EXISTING")}
                  className={`flex-1 py-1.5 rounded-lg transition ${
                    clientMode === "EXISTING"
                      ? "bg-white text-slate-900 font-bold shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Select Existing Client ({clientsList.length})
                </button>
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => setClientMode("NEW")}
                  className={`flex-1 py-1.5 rounded-lg transition ${
                    clientMode === "NEW"
                      ? "bg-white text-slate-900 font-bold shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  + Register New Client
                </button>
              </div>

              {/* Mode A: Select Existing Client */}
              {clientMode === "EXISTING" && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Assigned Client Profile *
                  </label>
                  <select
                    suppressHydrationWarning
                    required
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="">-- Choose from Registered Clients ({clientsList.length}) --</option>
                    {clientsList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.companyName ? `(${c.companyName})` : ""} • {c.phone}
                      </option>
                    ))}
                  </select>

                  {/* Client Info Pill */}
                  {(() => {
                    const sel = clientsList.find((c) => c.id === selectedClientId);
                    if (!sel) return null;
                    return (
                      <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-slate-800 flex items-center justify-between">
                        <div>
                          <div className="font-extrabold text-slate-900">{sel.name} {sel.companyName ? `(${sel.companyName})` : ""}</div>
                          <div className="text-[11px] text-slate-600 mt-0.5">{sel.phone} {sel.email ? `• ${sel.email}` : ""}</div>
                        </div>
                        {sel.gstin && (
                          <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-amber-200 text-amber-800 font-bold">
                            GSTIN: {sel.gstin}
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Mode B: Register New Client */}
              {clientMode === "NEW" && (
                <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">New Client Details</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Client Full Name *</label>
                      <input
                        suppressHydrationWarning
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                      <input
                        suppressHydrationWarning
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. +91 98400 12345"
                        className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                      <input
                        suppressHydrationWarning
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="client@gmail.com"
                        className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Firm Name</label>
                      <input
                        suppressHydrationWarning
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="e.g. SRM Industries Pvt Ltd"
                        className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Enquiry Project Details (Common) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Work Type *</label>
                  <select
                    suppressHydrationWarning
                    value={formData.workType}
                    onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Industrial & Factory Civil Works">Industrial & Factory Civil Works</option>
                    <option value="Commercial Complex Construction">Commercial Complex Construction</option>
                    <option value="Residential Turnkey House">Residential Turnkey House</option>
                    <option value="Project Management Consultancy (PMC)">Project Management Consultancy (PMC)</option>
                    <option value="Excavation & Earthmoving">Excavation & Earthmoving</option>
                    <option value="Architectural Planning & 3D Design">Architectural Planning & 3D Design</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Site Location *</label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    required
                    value={formData.siteLocation}
                    onChange={(e) => setFormData({ ...formData, siteLocation: e.target.value })}
                    placeholder="e.g. Perundurai SIPCOT"
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks</label>
                <textarea
                  suppressHydrationWarning
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Notes from initial call, land dimensions, structural requirements, client preferences..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Initial Follow-up & Reminder Section */}
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                    Initial Follow-up & Reminder
                  </span>
                  <span className="text-[10px] text-amber-800 font-semibold bg-white px-2 py-0.5 rounded border border-amber-200">
                    Auto-logs to Timeline
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Interaction Channel
                    </label>
                    <select
                      suppressHydrationWarning
                      value={formData.followupChannel}
                      onChange={(e) => setFormData({ ...formData, followupChannel: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="PHONE_CALL">Phone Call</option>
                      <option value="WHATSAPP">WhatsApp</option>
                      <option value="SITE_MEETING">Site Meeting</option>
                      <option value="OFFICE_VISIT">Office Visit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Next Follow-up Reminder Date
                    </label>
                    <input
                      suppressHydrationWarning
                      type="date"
                      value={formData.nextReminderDate}
                      onChange={(e) => setFormData({ ...formData, nextReminderDate: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Follow-up Discussion Notes (Optional)
                  </label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={formData.followupNotes}
                    onChange={(e) => setFormData({ ...formData, followupNotes: e.target.value })}
                    placeholder="e.g. Spoke with client. Requested drawing/estimation by tomorrow..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
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
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  {creating ? "Saving..." : "Save Enquiry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* FOLLOW-UP DRAWER */}
      {/* ======================================================== */}
      {activeEnquiry && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border-l border-slate-200 h-full flex flex-col p-6 shadow-2xl">
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div>
                <div className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">
                  Client Timeline & Call Log
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">{activeEnquiry.clientName}</h3>
                <p className="text-xs text-slate-500">{activeEnquiry.siteLocation}</p>
              </div>
              <button
                suppressHydrationWarning
                onClick={() => setActiveEnquiry(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Timeline Notes List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {loadingFollowups ? (
                <div className="text-center py-10 text-slate-500 text-xs">Loading followups...</div>
              ) : followups.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No notes recorded yet. Log the first client conversation below.
                </div>
              ) : (
                followups.map((f) => (
                  <div key={f.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 space-y-1 shadow-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{f.channel.replace("_", " ")}</span>
                      <span className="text-slate-500 text-[10px]">{new Date(f.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed pt-1">{f.notes}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-200">
                      <span>Logged by: {f.userName} ({f.userRole})</span>
                      {f.nextReminderDate && (
                        <span className="text-amber-700 font-bold">Next: {f.nextReminderDate}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add New Follow-up Note Form */}
            <form onSubmit={handleAddFollowup} className="pt-3 border-t border-slate-200 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Channel</label>
                  <select
                    suppressHydrationWarning
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="PHONE_CALL">Phone Call</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="SITE_MEETING">Site Meeting</option>
                    <option value="OFFICE_VISIT">Office Visit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Next Followup Reminder</label>
                  <input
                    suppressHydrationWarning
                    type="date"
                    value={nextReminder}
                    onChange={(e) => setNextReminder(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <textarea
                  suppressHydrationWarning
                  rows={3}
                  required
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record summary of conversation, client objections, revised budget..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs placeholder-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <button
                suppressHydrationWarning
                type="submit"
                disabled={savingNote}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50 transition"
              >
                <Send className="w-3.5 h-3.5" />
                {savingNote ? "Saving..." : "Log Follow-up Note"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
