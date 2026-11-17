"use client";

import { useEffect, useState } from "react";
import {
  BookUser,
  Plus,
  Search,
  Building,
  Phone,
  Mail,
  MapPin,
  Share2,
  Edit3,
  Trash2,
  X,
  AlertTriangle,
  RefreshCw,
  FolderTree,
  Filter,
  CheckCircle2,
  Star,
  ExternalLink,
  Table as TableIcon,
  LayoutGrid,
  Eye,
} from "lucide-react";

interface NetworkGroup {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  contactsCount: number;
}

interface NetworkContact {
  id: string;
  groupId: string;
  groupName: string;
  firmName: string | null;
  contactPerson: string;
  phone: string;
  alternatePhone: string | null;
  email: string | null;
  city: string;
  areaLocality: string | null;
  fullAddress: string | null;
  standardRate: string | null;
  rateUnit: string | null;
  paymentTerms: string | null;
  description: string | null;
  rating: number;
  tierLevel: string;
  gstin: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TradeNetworkPage() {
  const [groups, setGroups] = useState<NetworkGroup[]>([]);
  const [contacts, setContacts] = useState<NetworkContact[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedGroupId, setSelectedGroupId] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"GRID" | "TABLE">("GRID");

  // Create Group Modal State
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [savingGroup, setSavingGroup] = useState(false);

  // Edit Group Modal State
  const [editGroupModalOpen, setEditGroupModalOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupDesc, setEditGroupDesc] = useState("");
  const [savingEditGroup, setSavingEditGroup] = useState(false);

  // Delete Group Modal State
  const [deleteGroupModalOpen, setDeleteGroupModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<NetworkGroup | null>(null);
  const [deletingGroup, setDeletingGroup] = useState(false);

  // Create Contact Modal State (Simplified for fast data entry)
  const [createContactModalOpen, setCreateContactModalOpen] = useState(false);
  const [formGroupId, setFormGroupId] = useState("");
  const [formFirmName, setFormFirmName] = useState("");
  const [formContactPerson, setFormContactPerson] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formCity, setFormCity] = useState("Perundurai");
  const [formAreaLocality, setFormAreaLocality] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [savingContact, setSavingContact] = useState(false);

  // Edit Contact Modal State
  const [editContactModalOpen, setEditContactModalOpen] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [editGroupId, setEditGroupId] = useState("");
  const [editFirmName, setEditFirmName] = useState("");
  const [editContactPerson, setEditContactPerson] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editAreaLocality, setEditAreaLocality] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [savingEditContact, setSavingEditContact] = useState(false);

  // Delete Contact Modal State
  const [deleteContactModalOpen, setDeleteContactModalOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<NetworkContact | null>(null);
  const [deletingContact, setDeletingContact] = useState(false);

  // View Full Contact Details Modal State
  const [viewContactModalOpen, setViewContactModalOpen] = useState(false);
  const [activeContactView, setActiveContactView] = useState<NetworkContact | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [gRes, cRes] = await Promise.all([
        fetch("/api/admin/network/groups"),
        fetch("/api/admin/network/contacts"),
      ]);

      const gData = await gRes.json();
      const cData = await cRes.json();

      if (gRes.ok && gData.groups) {
        setGroups(gData.groups);
        if (gData.groups.length > 0 && !formGroupId) {
          setFormGroupId(gData.groups[0].id);
        }
      }

      if (cRes.ok && cData.contacts) {
        setContacts(cData.contacts);
      }
    } catch (err) {
      console.error("Error fetching network data:", err);
    } finally {
      setLoading(false);
    }
  }

  // Handle Create Group
  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setSavingGroup(true);

    try {
      const res = await fetch("/api/admin/network/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newGroupName,
          description: newGroupDescription,
        }),
      });

      if (res.ok) {
        setCreateGroupModalOpen(false);
        setNewGroupName("");
        setNewGroupDescription("");
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create group");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving group");
    } finally {
      setSavingGroup(false);
    }
  }

  // Handle Edit Group
  async function handleSaveEditGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!editingGroupId || !editGroupName.trim()) return;
    setSavingEditGroup(true);

    try {
      const res = await fetch(`/api/admin/network/groups/${editingGroupId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editGroupName,
          description: editGroupDesc,
        }),
      });

      if (res.ok) {
        setEditGroupModalOpen(false);
        setEditingGroupId(null);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update group");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating group");
    } finally {
      setSavingEditGroup(false);
    }
  }

  // Handle Delete Group
  async function handleConfirmDeleteGroup() {
    if (!groupToDelete) return;
    setDeletingGroup(true);

    try {
      const res = await fetch(`/api/admin/network/groups/${groupToDelete.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        if (selectedGroupId === groupToDelete.id) {
          setSelectedGroupId("ALL");
        }
        setDeleteGroupModalOpen(false);
        setGroupToDelete(null);
        fetchData();
      } else {
        alert("Failed to delete group");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting group");
    } finally {
      setDeletingGroup(false);
    }
  }

  // Handle Create Contact
  async function handleCreateContact(e: React.FormEvent) {
    e.preventDefault();
    if (!formContactPerson || !formPhone || !formCity || !formGroupId) return;
    setSavingContact(true);

    try {
      const res = await fetch("/api/admin/network/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: formGroupId,
          firmName: formFirmName,
          contactPerson: formContactPerson,
          phone: formPhone,
          email: formEmail,
          city: formCity,
          areaLocality: formAreaLocality,
          description: formDescription,
          rating: 5,
        }),
      });

      if (res.ok) {
        setCreateContactModalOpen(false);
        // Reset form
        setFormFirmName("");
        setFormContactPerson("");
        setFormPhone("");
        setFormEmail("");
        setFormAreaLocality("");
        setFormDescription("");
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save contact");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving contact");
    } finally {
      setSavingContact(false);
    }
  }

  // Open Edit Contact Modal
  function openEditContact(c: NetworkContact) {
    setEditingContactId(c.id);
    setEditGroupId(c.groupId);
    setEditFirmName(c.firmName || "");
    setEditContactPerson(c.contactPerson);
    setEditPhone(c.phone);
    setEditEmail(c.email || "");
    setEditCity(c.city);
    setEditAreaLocality(c.areaLocality || "");
    setEditDescription(c.description || "");
    setEditContactModalOpen(true);
  }

  // Handle Save Edit Contact
  async function handleSaveEditContact(e: React.FormEvent) {
    e.preventDefault();
    if (!editingContactId || !editContactPerson || !editPhone || !editCity) return;
    setSavingEditContact(true);

    try {
      const res = await fetch(`/api/admin/network/contacts/${editingContactId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: editGroupId,
          firmName: editFirmName,
          contactPerson: editContactPerson,
          phone: editPhone,
          email: editEmail,
          city: editCity,
          areaLocality: editAreaLocality,
          description: editDescription,
        }),
      });

      if (res.ok) {
        setEditContactModalOpen(false);
        setEditingContactId(null);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update contact");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating contact");
    } finally {
      setSavingEditContact(false);
    }
  }

  // Handle Delete Contact
  async function handleConfirmDeleteContact() {
    if (!contactToDelete) return;
    setDeletingContact(true);

    try {
      const res = await fetch(`/api/admin/network/contacts/${contactToDelete.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDeleteContactModalOpen(false);
        setContactToDelete(null);
        fetchData();
      } else {
        alert("Failed to delete contact");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting contact");
    } finally {
      setDeletingContact(false);
    }
  }

  // WhatsApp click handler
  function openWhatsApp(c: NetworkContact) {
    const cleanPhone = c.phone.replace(/\D/g, "");
    const msg = `Hello ${c.contactPerson}${c.firmName ? ` (${c.firmName})` : ""}, this is Kandhan Groups regarding construction operations and material/trade requirements.`;
    const url = cleanPhone
      ? `https://wa.me/91${cleanPhone.slice(-10)}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  }

  // Filter contacts
  const filteredContacts = contacts.filter((c) => {
    const matchesGroup = selectedGroupId === "ALL" || c.groupId === selectedGroupId;
    const matchesCity = cityFilter === "ALL" || c.city.toLowerCase() === cityFilter.toLowerCase();

    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      c.contactPerson.toLowerCase().includes(q) ||
      (c.firmName && c.firmName.toLowerCase().includes(q)) ||
      c.groupName.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.city.toLowerCase().includes(q) ||
      (c.areaLocality && c.areaLocality.toLowerCase().includes(q)) ||
      (c.description && c.description.toLowerCase().includes(q));

    return matchesGroup && matchesCity && matchesSearch;
  });

  // Extract unique cities for the dropdown
  const uniqueCities = Array.from(new Set(contacts.map((c) => c.city))).filter(Boolean);

  // Active selected group object
  const activeGroup = groups.find((g) => g.id === selectedGroupId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BookUser className="w-6 h-6 text-amber-500" />
            Trade Network & Operations Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Group-wise directory of architects, material suppliers, earthmovers, masons, and specialized trade contractors for operations.
          </p>
        </div>

        {/* Standardized Primary Action Buttons - Same recognized brand color for effortless use */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5">
          <button
            suppressHydrationWarning
            onClick={() => setCreateGroupModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <FolderTree className="w-4 h-4" /> + Add Group
          </button>

          <button
            suppressHydrationWarning
            onClick={() => {
              if (selectedGroupId !== "ALL") {
                setFormGroupId(selectedGroupId);
              }
              setCreateContactModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> + Add Trade Contact
          </button>
        </div>
      </div>

      {/* Group Navigation Bar (Category-Wise Segregation) */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <FolderTree className="w-4 h-4 text-amber-500" />
            <span>Operational Groups ({groups.length})</span>
          </div>

          {activeGroup && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Managing: <strong className="text-slate-900">{activeGroup.name}</strong></span>
              <button
                suppressHydrationWarning
                onClick={() => {
                  setEditingGroupId(activeGroup.id);
                  setEditGroupName(activeGroup.name);
                  setEditGroupDesc(activeGroup.description || "");
                  setEditGroupModalOpen(true);
                }}
                className="text-blue-600 hover:underline text-[11px] font-semibold"
              >
                Edit Group
              </button>
              <span className="text-slate-300">•</span>
              <button
                suppressHydrationWarning
                onClick={() => {
                  setGroupToDelete(activeGroup);
                  setDeleteGroupModalOpen(true);
                }}
                className="text-rose-600 hover:underline text-[11px] font-semibold"
              >
                Delete Group
              </button>
            </div>
          )}
        </div>

        {/* Group Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            suppressHydrationWarning
            onClick={() => setSelectedGroupId("ALL")}
            className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
              selectedGroupId === "ALL"
                ? "bg-slate-900 text-amber-400 shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            All Groups ({contacts.length})
          </button>

          {groups.map((g) => (
            <button
              suppressHydrationWarning
              key={g.id}
              onClick={() => setSelectedGroupId(g.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                selectedGroupId === g.id
                  ? "bg-amber-500 text-slate-950 shadow-xs font-extrabold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              <span>{g.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedGroupId === g.id
                    ? "bg-slate-950 text-amber-400 font-mono"
                    : "bg-white text-slate-500 border border-slate-200 font-mono"
                }`}
              >
                {g.contactsCount}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            suppressHydrationWarning
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search firm, contact, phone, city, rates, or specs..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Group Dropdown Selector */}
          <div className="flex items-center gap-1.5">
            <FolderTree className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              suppressHydrationWarning
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none font-medium"
            >
              <option value="ALL">All Groups ({contacts.length})</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.contactsCount})
                </option>
              ))}
            </select>
          </div>

          {/* City / Proximity Selector */}
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              suppressHydrationWarning
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none font-medium"
            >
              <option value="ALL">All Cities ({contacts.length})</option>
              {uniqueCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button
              suppressHydrationWarning
              onClick={() => setViewMode("GRID")}
              className={`p-1.5 rounded-lg transition ${
                viewMode === "GRID"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              suppressHydrationWarning
              onClick={() => setViewMode("TABLE")}
              className={`p-1.5 rounded-lg transition ${
                viewMode === "TABLE"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Comparison Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
          Loading business network...
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
          <BookUser className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <div className="text-sm font-bold text-slate-800">No trade contacts found</div>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {selectedGroupId !== "ALL"
              ? `No contacts in "${activeGroup?.name || "this group"}". Click "Add Trade Contact" to enter suppliers or masons.`
              : 'Click "Add Trade Contact" to enter architects, suppliers, or specialized contractors.'}
          </p>
        </div>
      ) : viewMode === "GRID" ? (
        /* GRID / CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-amber-400 transition p-4 shadow-xs flex flex-col justify-between group"
            >
              <div>
                {/* Card Top: Group Tag & Location */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 truncate">
                    {c.groupName}
                  </span>

                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    <span>{c.city}</span>
                    {c.areaLocality && <span className="text-slate-400">• {c.areaLocality}</span>}
                  </div>
                </div>

                {/* Firm Name & Contact Person */}
                <div className="mb-2.5">
                  <h3 className="font-extrabold text-slate-950 text-base leading-tight">
                    {c.firmName || c.contactPerson}
                  </h3>
                  {c.firmName && (
                    <div className="text-xs text-slate-600 font-semibold mt-0.5">
                      Contact: {c.contactPerson}
                    </div>
                  )}
                </div>

                {/* Description & Remarks */}
                {c.description && (
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {c.description}
                  </p>
                )}
              </div>

              {/* Card Footer: WhatsApp, Call, Edit, Delete */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    suppressHydrationWarning
                    onClick={() => openWhatsApp(c)}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                    title="Send WhatsApp Message"
                  >
                    <Share2 className="w-3.5 h-3.5" /> WhatsApp
                  </button>

                  <a
                    href={`tel:${c.phone}`}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                    title="Direct Phone Call"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call
                  </a>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    suppressHydrationWarning
                    onClick={() => {
                      setActiveContactView(c);
                      setViewContactModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                    title="View Full Details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    suppressHydrationWarning
                    onClick={() => openEditContact(c)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                    title="Edit Contact"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                  </button>
                  <button
                    suppressHydrationWarning
                    onClick={() => {
                      setContactToDelete(c);
                      setDeleteContactModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition cursor-pointer"
                    title="Delete Contact"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW (CLEAN DIRECTORY LIST) */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-600 uppercase tracking-wider border-b border-slate-200 font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-4 w-40">Group</th>
                  <th className="py-3 px-4">Firm & Contact Person</th>
                  <th className="py-3 px-3 w-36">City / Location</th>
                  <th className="py-3 px-3 w-32">Phone</th>
                  <th className="py-3 px-4">Remarks / Notes</th>
                  <th className="py-3 px-4 w-32 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContacts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-bold text-amber-900 whitespace-nowrap">
                      {c.groupName}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-slate-900">{c.firmName || c.contactPerson}</div>
                      {c.firmName && (
                        <div className="text-[11px] text-slate-500">{c.contactPerson}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700 whitespace-nowrap">
                      {c.city}
                      {c.areaLocality && <div className="text-[10px] text-slate-500">{c.areaLocality}</div>}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-800 whitespace-nowrap">
                      {c.phone}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {c.description || "-"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          suppressHydrationWarning
                          onClick={() => {
                            setActiveContactView(c);
                            setViewContactModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          title="View Full Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          suppressHydrationWarning
                          onClick={() => openWhatsApp(c)}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition"
                          title="WhatsApp"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          suppressHydrationWarning
                          onClick={() => openEditContact(c)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                        </button>
                        <button
                          suppressHydrationWarning
                          onClick={() => {
                            setContactToDelete(c);
                            setDeleteContactModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition"
                          title="Delete"
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
      {/* CREATE NEW GROUP MODAL */}
      {/* ======================================================== */}
      {createGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-amber-500" />
                Add Operational Group
              </h3>
              <button
                suppressHydrationWarning
                onClick={() => setCreateGroupModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Group / Trade Name * (e.g. Hollow Blocks, Bricks, Architects, Cement)
                </label>
                <input
                  suppressHydrationWarning
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. Hollow Blocks, Cement, Painters, Architects"
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Trade Notes
                </label>
                <textarea
                  rows={3}
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="Brief description of materials, labor, or equipment under this group..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => setCreateGroupModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  suppressHydrationWarning
                  type="submit"
                  disabled={savingGroup}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {savingGroup ? "Creating..." : "Create Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EDIT GROUP MODAL */}
      {/* ======================================================== */}
      {editGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-amber-500" />
                Edit Group Name
              </h3>
              <button
                suppressHydrationWarning
                onClick={() => setEditGroupModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Group / Trade Name *
                </label>
                <input
                  suppressHydrationWarning
                  type="text"
                  required
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editGroupDesc}
                  onChange={(e) => setEditGroupDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => setEditGroupModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  suppressHydrationWarning
                  type="submit"
                  disabled={savingEditGroup}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {savingEditGroup ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DELETE GROUP MODAL */}
      {/* ======================================================== */}
      {deleteGroupModalOpen && groupToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl text-slate-900">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Delete Group</h3>
                <p className="text-xs text-slate-500">
                  Are you sure you want to delete <strong className="text-slate-900">{groupToDelete.name}</strong>?
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Deleting this group will also remove all contacts stored inside this group.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setDeleteGroupModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                suppressHydrationWarning
                type="button"
                onClick={handleConfirmDeleteGroup}
                disabled={deletingGroup}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 cursor-pointer disabled:opacity-50"
              >
                {deletingGroup ? "Deleting..." : "Yes, Delete Group"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CREATE CONTACT MODAL (SIMPLIFIED & FAST TO ENTER) */}
      {/* ======================================================== */}
      {createContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl text-slate-900 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-500" />
                Add Contact to Group
              </h3>
              <button
                suppressHydrationWarning
                onClick={() => setCreateContactModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="space-y-4">
              {/* Group Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assign to Operational Group *
                </label>
                <select
                  suppressHydrationWarning
                  required
                  value={formGroupId}
                  onChange={(e) => setFormGroupId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none font-bold"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Firm & Contact Person */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Firm / Business Name (Optional)
                  </label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={formFirmName}
                    onChange={(e) => setFormFirmName(e.target.value)}
                    placeholder="e.g. Kaveri Hollow Blocks & Pavers"
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Person Name *
                  </label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    required
                    value={formContactPerson}
                    onChange={(e) => setFormContactPerson(e.target.value)}
                    placeholder="e.g. K. Velusamy"
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Phone (WhatsApp) *
                  </label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="e.g. 94862 33441"
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    suppressHydrationWarning
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="optional@gmail.com"
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* City & Locality */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City / Town *
                  </label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    required
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="e.g. Perundurai, Erode, Coimbatore"
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Area / Locality (Optional)
                  </label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={formAreaLocality}
                    onChange={(e) => setFormAreaLocality(e.target.value)}
                    placeholder="e.g. SIPCOT Main Road, Kunnathur Road"
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Remarks / Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Remarks / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. Supplies 8-inch blocks, trusted mason gang leader, prompt site delivery..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => setCreateContactModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  suppressHydrationWarning
                  type="submit"
                  disabled={savingContact}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {savingContact ? "Saving Contact..." : "Save Trade Contact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EDIT CONTACT MODAL (STANDARDIZED & CLEAN) */}
      {/* ======================================================== */}
      {editContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl text-slate-900 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" />
                Edit Trade Contact
              </h3>
              <button
                suppressHydrationWarning
                onClick={() => setEditContactModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditContact} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Operational Group *
                </label>
                <select
                  suppressHydrationWarning
                  required
                  value={editGroupId}
                  onChange={(e) => setEditGroupId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none font-bold"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Firm / Business Name (Optional)
                  </label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={editFirmName}
                    onChange={(e) => setEditFirmName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Person Name *
                  </label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    required
                    value={editContactPerson}
                    onChange={(e) => setEditContactPerson(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Phone (WhatsApp) *
                  </label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    suppressHydrationWarning
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City / Town *
                  </label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    required
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Area / Locality (Optional)
                  </label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={editAreaLocality}
                    onChange={(e) => setEditAreaLocality(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Remarks / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => setEditContactModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  suppressHydrationWarning
                  type="submit"
                  disabled={savingEditContact}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {savingEditContact ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DELETE CONTACT MODAL */}
      {/* ======================================================== */}
      {deleteContactModalOpen && contactToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl text-slate-900">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Delete Contact</h3>
                <p className="text-xs text-slate-500">Remove from directory.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Are you sure you want to delete{" "}
              <strong className="text-slate-900">
                {contactToDelete.firmName || contactToDelete.contactPerson}
              </strong>{" "}
              from <strong className="text-amber-800">{contactToDelete.groupName}</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setDeleteContactModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                suppressHydrationWarning
                type="button"
                onClick={handleConfirmDeleteContact}
                disabled={deletingContact}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 cursor-pointer disabled:opacity-50"
              >
                {deletingContact ? "Deleting..." : "Yes, Delete Contact"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ======================================================== */}
      {/* VIEW FULL CONTACT DETAILS MODAL */}
      {/* ======================================================== */}
      {viewContactModalOpen && activeContactView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-900 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 mb-4 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  {activeContactView.groupName}
                </span>
                <h2 className="text-lg font-extrabold text-slate-950 mt-1.5 leading-tight">
                  {activeContactView.firmName || activeContactView.contactPerson}
                </h2>
                {activeContactView.firmName && (
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Contact: {activeContactView.contactPerson}
                  </p>
                )}
              </div>
              <button
                suppressHydrationWarning
                onClick={() => setViewContactModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Contact Information */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Contact Information
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Primary Phone (WhatsApp):</span>
                    <a href={`tel:${activeContactView.phone}`} className="font-bold text-slate-900 hover:underline">
                      {activeContactView.phone}
                    </a>
                  </div>
                  {activeContactView.email && (
                    <div>
                      <span className="text-slate-400 block text-[11px]">Email Address:</span>
                      <a href={`mailto:${activeContactView.email}`} className="text-blue-600 hover:underline">
                        {activeContactView.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Location & Operating Area
                </div>
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>{activeContactView.city}</span>
                  {activeContactView.areaLocality && <span>• {activeContactView.areaLocality}</span>}
                </div>
              </div>

              {/* Remarks / Notes */}
              {activeContactView.description && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Remarks / Notes / Specs
                  </div>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {activeContactView.description}
                  </p>
                </div>
              )}

              {/* Actions Footer - Standardized Recognizable Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    suppressHydrationWarning
                    onClick={() => openWhatsApp(activeContactView)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <Share2 className="w-4 h-4" /> WhatsApp
                  </button>
                  <a
                    href={`tel:${activeContactView.phone}`}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <Phone className="w-4 h-4" /> Call Now
                  </a>
                </div>

                <button
                  suppressHydrationWarning
                  onClick={() => {
                    setViewContactModalOpen(false);
                    openEditContact(activeContactView);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Edit3 className="w-4 h-4" /> Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

