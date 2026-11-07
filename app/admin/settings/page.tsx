"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Building,
  Save,
  CheckCircle2,
  Landmark,
  FileText,
  AlertCircle,
  Plus,
  Edit3,
  Trash2,
  Check,
  Star,
  X,
  Layers,
  HardHat,
  Search,
  Briefcase,
  RefreshCw,
} from "lucide-react";

interface BankAccount {
  id: string;
  accountNickname: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string | null;
  upiId: string | null;
  isDefault: boolean;
}

interface MasterItem {
  id: string;
  category: string;
  itemName: string;
  description: string;
  unit: string;
  standardRate: number;
  hsnSacCode: string | null;
  isCustom: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"PROFILE" | "BANKS" | "MASTER_ITEMS">("PROFILE");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Profile Form
  const [formData, setFormData] = useState({
    companyName: "Kandhan Groups",
    address: "",
    phone: "",
    email: "",
    gstin: "",
    pan: "",
    defaultTerms: "",
  });

  // Banks State
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [bankForm, setBankForm] = useState({
    accountNickname: "",
    bankName: "",
    accountHolderName: "Kandhan Groups",
    accountNumber: "",
    ifscCode: "",
    branch: "",
    upiId: "",
    isDefault: false,
  });

  // Master Items State
  const [masterItemsList, setMasterItemsList] = useState<MasterItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [itemSearch, setItemSearch] = useState("");
  const [itemCategoryFilter, setItemCategoryFilter] = useState("ALL");
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemForm, setItemForm] = useState({
    category: "Civil & Earthworks",
    itemName: "",
    description: "",
    unit: "sq.ft",
    standardRate: 0,
    hsnSacCode: "9954",
  });

  useEffect(() => {
    fetchSettings();
    fetchBanks();
    fetchMasterItems();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (res.ok && data.settings) {
        setFormData({
          companyName: data.settings.companyName || "Kandhan Groups",
          address: data.settings.address || "",
          phone: data.settings.phone || "",
          email: data.settings.email || "",
          gstin: data.settings.gstin || "",
          pan: data.settings.pan || "",
          defaultTerms: data.settings.defaultTerms || "",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchBanks() {
    setLoadingBanks(true);
    try {
      const res = await fetch("/api/admin/banks");
      const data = await res.json();
      if (res.ok && data.banks) {
        setBanks(data.banks);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBanks(false);
    }
  }

  async function fetchMasterItems() {
    setLoadingItems(true);
    try {
      const res = await fetch("/api/admin/master-items");
      const data = await res.json();
      if (res.ok && data.items) {
        setMasterItemsList(data.items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingItems(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveBank(e: React.FormEvent) {
    e.preventDefault();
    try {
      const method = editingBankId ? "PUT" : "POST";
      const payload = editingBankId ? { ...bankForm, id: editingBankId } : bankForm;
      const res = await fetch("/api/admin/banks", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setBankModalOpen(false);
        setEditingBankId(null);
        setBankForm({
          accountNickname: "",
          bankName: "",
          accountHolderName: "Kandhan Groups",
          accountNumber: "",
          ifscCode: "",
          branch: "",
          upiId: "",
          isDefault: false,
        });
        fetchBanks();
      } else {
        alert("Failed to save bank account");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSetDefaultBank(id: string) {
    try {
      const b = banks.find((x) => x.id === id);
      if (!b) return;
      await fetch("/api/admin/banks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...b, isDefault: true }),
      });
      fetchBanks();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSaveMasterItem(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/master-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemForm),
      });

      if (res.ok) {
        setItemModalOpen(false);
        setItemForm({
          category: "Civil & Earthworks",
          itemName: "",
          description: "",
          unit: "sq.ft",
          standardRate: 0,
          hsnSacCode: "9954",
        });
        fetchMasterItems();
      } else {
        alert("Failed to save master item");
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Filter master items
  const filteredMasterItems = masterItemsList.filter((it) => {
    const matchesSearch =
      it.itemName.toLowerCase().includes(itemSearch.toLowerCase()) ||
      it.description.toLowerCase().includes(itemSearch.toLowerCase()) ||
      it.category.toLowerCase().includes(itemSearch.toLowerCase());
    const matchesCat = itemCategoryFilter === "ALL" || it.category === itemCategoryFilter;
    return matchesSearch && matchesCat;
  });

  const categories = Array.from(new Set(masterItemsList.map((i) => i.category)));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-amber-500" />
          Master Configuration & Company Suite
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage Kandhan Groups official branding, GSTIN, multiple bank accounts, and the master BOQ & labor rate library.
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          suppressHydrationWarning
          onClick={() => setActiveTab("PROFILE")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "PROFILE"
              ? "bg-[#0B192C] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Building className="w-4 h-4 text-amber-400" />
          Company Profile & Letterhead
        </button>

        <button
          suppressHydrationWarning
          onClick={() => setActiveTab("BANKS")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "BANKS"
              ? "bg-[#0B192C] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Landmark className="w-4 h-4 text-amber-400" />
          Bank Accounts Registry ({banks.length})
        </button>

        <button
          suppressHydrationWarning
          onClick={() => setActiveTab("MASTER_ITEMS")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === "MASTER_ITEMS"
              ? "bg-[#0B192C] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Layers className="w-4 h-4 text-amber-400" />
          Master BOQ & Labor Catalog ({masterItemsList.length})
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: COMPANY PROFILE */}
      {/* ======================================================== */}
      {activeTab === "PROFILE" && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {savedSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Company settings successfully saved! Changes are now live across all quotations and invoices.</span>
            </div>
          )}

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
              <Building className="w-4 h-4 text-amber-500" />
              Official Business Identity & Letterhead Header
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Legal Trade Name *</label>
                <input
                  suppressHydrationWarning
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State GSTIN (15 Digits)</label>
                <input
                  suppressHydrationWarning
                  type="text"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  placeholder="33AAAAA0000A1Z5"
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 uppercase font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Income Tax PAN</label>
                <input
                  suppressHydrationWarning
                  type="text"
                  value={formData.pan}
                  onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                  placeholder="AAAAA0000A"
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 uppercase font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Official Contact Phone</label>
                <input
                  suppressHydrationWarning
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 94883 44434"
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Official Business Email</label>
                <input
                  suppressHydrationWarning
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="kandhangroups@gmail.com"
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Business Address</label>
                <input
                  suppressHydrationWarning
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Perundurai Road, Erode, Tamil Nadu 638052"
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
              <FileText className="w-4 h-4 text-blue-500" />
              Standard Terms, Conditions & Payment Milestones
            </h2>
            <p className="text-xs text-slate-500">
              Default terms and payment conditions automatically loaded on new Quotations, Work Orders, and Contracts.
            </p>

            <textarea
              suppressHydrationWarning
              rows={6}
              value={formData.defaultTerms}
              onChange={(e) => setFormData({ ...formData, defaultTerms: e.target.value })}
              placeholder="1. Payment Milestones: 20% Mobilization Advance, 40% Structure completion, 30% Plastering & Flooring, 10% on Final Handover.&#10;2. Water and 3-phase electricity to be provided at site by the client.&#10;3. Cement and Steel rates are subject to market escalation if project duration exceeds 6 months.&#10;4. Defect liability period is 12 calendar months from handover date."
              className="w-full px-3 py-2.5 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono leading-relaxed focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end">
            <button
              suppressHydrationWarning
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50 transition"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving Changes..." : "Save Company Profile"}
            </button>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* TAB 2: BANK ACCOUNTS REGISTRY */}
      {/* ======================================================== */}
      {activeTab === "BANKS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-amber-500" />
                Selectable Company Bank Accounts
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Register multiple bank accounts (Current, Project Escrow, SBI). When creating quotes or invoices, pick which bank to print.
              </p>
            </div>
            <button
              suppressHydrationWarning
              onClick={() => {
                setEditingBankId(null);
                setBankForm({
                  accountNickname: "",
                  bankName: "",
                  accountHolderName: "Kandhan Groups",
                  accountNumber: "",
                  ifscCode: "",
                  branch: "",
                  upiId: "",
                  isDefault: banks.length === 0,
                });
                setBankModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs cursor-pointer transition"
            >
              <Plus className="w-4 h-4" />
              Add Bank Account
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banks.map((b) => (
              <div
                key={b.id}
                className={`p-5 rounded-2xl border transition shadow-xs ${
                  b.isDefault
                    ? "bg-amber-50/60 border-amber-300 ring-1 ring-amber-400"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">{b.accountNickname}</span>
                      {b.isDefault && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-slate-950" /> Default
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-slate-700 mt-1">{b.bankName}</div>
                  </div>

                  <div className="flex items-center gap-1">
                    {!b.isDefault && (
                      <button
                        suppressHydrationWarning
                        onClick={() => handleSetDefaultBank(b.id)}
                        className="px-2 py-1 rounded text-[10px] font-bold bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 transition cursor-pointer"
                        title="Make Default Bank"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      suppressHydrationWarning
                      onClick={() => {
                        setEditingBankId(b.id);
                        setBankForm({
                          accountNickname: b.accountNickname,
                          bankName: b.bankName,
                          accountHolderName: b.accountHolderName,
                          accountNumber: b.accountNumber,
                          ifscCode: b.ifscCode,
                          branch: b.branch || "",
                          upiId: b.upiId || "",
                          isDefault: b.isDefault,
                        });
                        setBankModalOpen(true);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-blue-600 transition"
                      title="Edit Bank"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">Account Number</span>
                    <span className="font-mono font-bold text-slate-900">{b.accountNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">IFSC Code</span>
                    <span className="font-mono font-bold text-slate-900">{b.ifscCode}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">Beneficiary</span>
                    <span className="text-slate-700">{b.accountHolderName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">Branch</span>
                    <span className="text-slate-700">{b.branch || "Not Specified"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: MASTER BOQ & LABOR RATES CATALOG */}
      {/* ======================================================== */}
      {activeTab === "MASTER_ITEMS" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                suppressHydrationWarning
                type="text"
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                placeholder="Search civil items, mason, painter, steel rates..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                suppressHydrationWarning
                value={itemCategoryFilter}
                onChange={(e) => setItemCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:outline-none"
              >
                <option value="ALL">All Categories ({masterItemsList.length})</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <button
                suppressHydrationWarning
                onClick={() => setItemModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs cursor-pointer transition shrink-0"
              >
                <Plus className="w-4 h-4" />
                Add Item / Rate
              </button>
            </div>
          </div>

          {/* Master Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Item Name & Category</th>
                  <th className="py-3 px-4">Detailed Specification</th>
                  <th className="py-3 px-3 w-20 text-center">Unit</th>
                  <th className="py-3 px-3 w-24 text-center">SAC Code</th>
                  <th className="py-3 px-4 w-32 text-right">Standard Rate (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMasterItems.map((it) => (
                  <tr key={it.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900">{it.itemName}</div>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {it.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs max-w-md">
                      {it.description}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-semibold text-slate-800">
                      {it.unit}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-slate-500">
                      {it.hsnSacCode || "9954"}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-amber-600 text-sm">
                      ₹{it.standardRate.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT BANK ACCOUNT */}
      {/* ======================================================== */}
      {bankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-900">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-amber-500" />
                {editingBankId ? "Edit Company Bank Account" : "Register Company Bank Account"}
              </h2>
              <button
                suppressHydrationWarning
                onClick={() => setBankModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBank} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account Nickname *</label>
                <input
                  suppressHydrationWarning
                  type="text"
                  required
                  value={bankForm.accountNickname}
                  onChange={(e) => setBankForm({ ...bankForm, accountNickname: e.target.value })}
                  placeholder="e.g. HDFC Main Operating Current A/C"
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name *</label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    required
                    value={bankForm.bankName}
                    onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                    placeholder="e.g. HDFC Bank Ltd"
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Beneficiary Name *</label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    required
                    value={bankForm.accountHolderName}
                    onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account Number *</label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    required
                    value={bankForm.accountNumber}
                    onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                    placeholder="50200088991122"
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs font-mono focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">IFSC Code *</label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    required
                    value={bankForm.ifscCode}
                    onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })}
                    placeholder="HDFC0001420"
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs uppercase font-mono focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branch Name</label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={bankForm.branch}
                    onChange={(e) => setBankForm({ ...bankForm, branch: e.target.value })}
                    placeholder="Perundurai Main Branch"
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">UPI ID (Optional)</label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={bankForm.upiId}
                    onChange={(e) => setBankForm({ ...bankForm, upiId: e.target.value })}
                    placeholder="kandhan@hdfcbank"
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  suppressHydrationWarning
                  type="checkbox"
                  id="defaultBankCheck"
                  checked={bankForm.isDefault}
                  onChange={(e) => setBankForm({ ...bankForm, isDefault: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                />
                <label htmlFor="defaultBankCheck" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Set as default account on new quotes & invoices
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => setBankModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  suppressHydrationWarning
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer transition"
                >
                  Save Bank Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD MASTER BOQ / LABOR ITEM */}
      {/* ======================================================== */}
      {itemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-900">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-500" />
                Add Master BOQ Item / Labor Rate
              </h2>
              <button
                suppressHydrationWarning
                onClick={() => setItemModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMasterItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    suppressHydrationWarning
                    value={itemForm.category}
                    onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Civil & Earthworks">Civil & Earthworks</option>
                    <option value="RCC & Structural">RCC & Structural</option>
                    <option value="Masonry & Plastering">Masonry & Plastering</option>
                    <option value="Flooring & Tremix">Flooring & Tremix</option>
                    <option value="Fabrication & PEB Shed">Fabrication & PEB Shed</option>
                    <option value="Labor & Manpower">Labor & Manpower</option>
                    <option value="Electrical & Plumbing">Electrical & Plumbing</option>
                    <option value="Demolition & Site Clearance">Demolition & Site Clearance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Item Title / Role *</label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    required
                    value={itemForm.itemName}
                    onChange={(e) => setItemForm({ ...itemForm, itemName: e.target.value })}
                    placeholder="e.g. Mason (Grade-1) or M25 Concrete"
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Technical Specification *</label>
                <textarea
                  suppressHydrationWarning
                  rows={3}
                  required
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  placeholder="Detailed standard scope, materials used, mix ratio, grade..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit *</label>
                  <select
                    suppressHydrationWarning
                    value={itemForm.unit}
                    onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="sq.ft">sq.ft</option>
                    <option value="cu.ft">cu.ft</option>
                    <option value="cu.m">cu.m</option>
                    <option value="tons">tons</option>
                    <option value="kg">kg</option>
                    <option value="bags">bags</option>
                    <option value="days">days (Labor)</option>
                    <option value="nos">nos</option>
                    <option value="r.ft">r.ft</option>
                    <option value="lump_sum">lump_sum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Standard Rate (₹)</label>
                  <input
                    suppressHydrationWarning
                    type="number"
                    value={itemForm.standardRate}
                    onChange={(e) => setItemForm({ ...itemForm, standardRate: Number(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs text-right focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SAC Code</label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={itemForm.hsnSacCode}
                    onChange={(e) => setItemForm({ ...itemForm, hsnSacCode: e.target.value })}
                    placeholder="9954"
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs text-center font-mono focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => setItemModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  suppressHydrationWarning
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer transition"
                >
                  Save to Master Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
