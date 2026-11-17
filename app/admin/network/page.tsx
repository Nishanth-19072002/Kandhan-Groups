"use client";

import { useEffect, useState, useMemo } from "react";
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
  Check,
  Tag,
  Settings2,
  Layers,
  ChevronRight,
  Info,
  LayoutGrid,
  Table as TableIcon,
  Eye,
  Briefcase,
  Truck,
  Wrench,
  Boxes,
} from "lucide-react";

type DepartmentType = "MATERIALS" | "TRADES_LABOR" | "EQUIPMENT" | "SERVICES";

const DEPARTMENT_CONFIG: Record<
  DepartmentType,
  { label: string; icon: any; color: string; badge: string }
> = {
  MATERIALS: {
    label: "Civil Materials",
    icon: Boxes,
    color: "text-blue-600 bg-blue-50 border-blue-200",
    badge: "bg-blue-100 text-blue-900 border-blue-200",
  },
  TRADES_LABOR: {
    label: "Trades & Labor",
    icon: Wrench,
    color: "text-amber-600 bg-amber-50 border-amber-200",
    badge: "bg-amber-100 text-amber-900 border-amber-200",
  },
  EQUIPMENT: {
    label: "Equipment & Rental",
    icon: Truck,
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    badge: "bg-emerald-100 text-emerald-900 border-emerald-200",
  },
  SERVICES: {
    label: "Services & Engineers",
    icon: Briefcase,
    color: "text-purple-600 bg-purple-50 border-purple-200",
    badge: "bg-purple-100 text-purple-900 border-purple-200",
  },
};

interface NetworkCategory {
  id: string;
  department: DepartmentType;
  name: string;
  aliases: string | null;
  defaultUnit: string | null;
  description: string | null;
  supplierCount: number;
}

interface ContactSupply {
  id?: string;
  contactId?: string;
  categoryId: string;
  categoryName?: string;
  department?: DepartmentType;
  aliases?: string | null;
  defaultUnit?: string | null;
  brandOrSpecs?: string | null;
  standardRate?: string | null;
  rateUnit?: string | null;
  notes?: string | null;
}

interface NetworkGroup {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  contactsCount: number;
}

interface NetworkContact {
  id: string;
  groupId: string | null;
  groupName: string | null;
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
  supplies: ContactSupply[];
}

export default function TradeNetworkPage() {
  const [categories, setCategories] = useState<NetworkCategory[]>([]);
  const [groups, setGroups] = useState<NetworkGroup[]>([]);
  const [contacts, setContacts] = useState<NetworkContact[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDepartment, setSelectedDepartment] = useState<string>("ALL");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("ALL");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"GRID" | "TABLE">("GRID");

  // Manage Categories / Items Modal State
  const [manageCategoriesModalOpen, setManageCategoriesModalOpen] = useState(false);
  const [categoryDeptTab, setCategoryDeptTab] = useState<DepartmentType>("MATERIALS");
  const [categoryModalMode, setCategoryModalMode] = useState<"LIST" | "CREATE" | "EDIT">("LIST");
  const [catFormId, setCatFormId] = useState("");
  const [catFormDept, setCatFormDept] = useState<DepartmentType>("MATERIALS");
  const [catFormName, setCatFormName] = useState("");
  const [catFormAliases, setCatFormAliases] = useState("");
  const [catFormUnit, setCatFormUnit] = useState("per unit");
  const [catFormDescription, setCatFormDescription] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<NetworkCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState(false);

  // Create / Edit Contact Modal State
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [formFirmName, setFormFirmName] = useState("");
  const [formContactPerson, setFormContactPerson] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formCity, setFormCity] = useState("Perundurai");
  const [formAreaLocality, setFormAreaLocality] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formGroupId, setFormGroupId] = useState<string>("");
  // Selected Supplies: categoryId -> { brandOrSpecs, standardRate, rateUnit, notes }
  const [selectedSuppliesMap, setSelectedSuppliesMap] = useState<
    Record<string, { brandOrSpecs: string; standardRate: string; rateUnit: string; notes: string }>
  >({});
  const [formSupplyDeptTab, setFormSupplyDeptTab] = useState<DepartmentType>("MATERIALS");
  const [formSupplySearch, setFormSupplySearch] = useState("");
  const [savingContact, setSavingContact] = useState(false);

  // Quick Inline New Category Modal (triggered from contact form)
  const [inlineCatModalOpen, setInlineCatModalOpen] = useState(false);
  const [inlineCatName, setInlineCatName] = useState("");
  const [inlineCatDept, setInlineCatDept] = useState<DepartmentType>("MATERIALS");
  const [inlineCatUnit, setInlineCatUnit] = useState("per bag");
  const [inlineCatAliases, setInlineCatAliases] = useState("");
  const [savingInlineCat, setSavingInlineCat] = useState(false);

  // Delete Contact Modal State
  const [deleteContactModalOpen, setDeleteContactModalOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<NetworkContact | null>(null);
  const [deletingContact, setDeletingContact] = useState(false);

  // View Full Contact Details Modal State
  const [viewContactModalOpen, setViewContactModalOpen] = useState(false);
  const [activeContactView, setActiveContactView] = useState<NetworkContact | null>(null);

  // Legacy Group Management Modals
  const [manageGroupsModalOpen, setManageGroupsModalOpen] = useState(false);
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [savingGroup, setSavingGroup] = useState(false);
  const [editGroupModalOpen, setEditGroupModalOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupDesc, setEditGroupDesc] = useState("");
  const [savingEditGroup, setSavingEditGroup] = useState(false);
  const [deleteGroupModalOpen, setDeleteGroupModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<NetworkGroup | null>(null);
  const [deletingGroup, setDeletingGroup] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [catRes, grpRes, cntRes] = await Promise.all([
        fetch("/api/admin/network/categories"),
        fetch("/api/admin/network/groups"),
        fetch("/api/admin/network/contacts"),
      ]);

      const catData = await catRes.json();
      const grpData = await grpRes.json();
      const cntData = await cntRes.json();

      if (catRes.ok && catData.categories) {
        setCategories(catData.categories);
      }
      if (grpRes.ok && grpData.groups) {
        setGroups(grpData.groups);
      }
      if (cntRes.ok && cntData.contacts) {
        setContacts(cntData.contacts);
      }
    } catch (err) {
      console.error("Error fetching network data:", err);
    } finally {
      setLoading(false);
    }
  }

  // Handle Quick Category Create (inline from Contact Form)
  async function handleCreateInlineCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!inlineCatName.trim()) return;
    setSavingInlineCat(true);

    try {
      const res = await fetch("/api/admin/network/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inlineCatName.trim(),
          department: inlineCatDept,
          defaultUnit: inlineCatUnit.trim(),
          aliases: inlineCatAliases.trim() || null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.category) {
        // Add to categories state
        setCategories((prev) => [...prev, data.category]);
        // Automatically check this newly created item for the active contact form
        setSelectedSuppliesMap((prev) => ({
          ...prev,
          [data.category.id]: {
            brandOrSpecs: "",
            standardRate: "",
            rateUnit: data.category.defaultUnit || "per unit",
            notes: "",
          },
        }));
        setInlineCatName("");
        setInlineCatAliases("");
        setInlineCatModalOpen(false);
      } else {
        alert(data.error || "Failed to create item");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating item");
    } finally {
      setSavingInlineCat(false);
    }
  }

  // Handle Category Save in "Manage Categories" modal
  async function handleSaveCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!catFormName.trim()) return;
    setSavingCategory(true);

    try {
      const payload = {
        name: catFormName.trim(),
        department: catFormDept,
        defaultUnit: catFormUnit.trim(),
        aliases: catFormAliases.trim() || null,
        description: catFormDescription.trim() || null,
      };

      const isEdit = categoryModalMode === "EDIT" && catFormId;
      const url = isEdit
        ? `/api/admin/network/categories/${catFormId}`
        : "/api/admin/network/categories";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setCategoryModalMode("LIST");
        setCatFormId("");
        setCatFormName("");
        setCatFormAliases("");
        setCatFormUnit("per unit");
        setCatFormDescription("");
        fetchData();
      } else {
        alert(data.error || "Failed to save item");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving category");
    } finally {
      setSavingCategory(false);
    }
  }

  // Handle Category Delete
  async function handleConfirmDeleteCategory() {
    if (!categoryToDelete) return;
    setDeletingCategory(true);

    try {
      const res = await fetch(`/api/admin/network/categories/${categoryToDelete.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        if (selectedCategoryId === categoryToDelete.id) {
          setSelectedCategoryId("ALL");
        }
        setCategoryToDelete(null);
        fetchData();
      } else {
        alert("Failed to delete category");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting category");
    } finally {
      setDeletingCategory(false);
    }
  }

  // Open Create Contact Modal
  function openCreateContact() {
    setEditingContactId(null);
    setFormFirmName("");
    setFormContactPerson("");
    setFormPhone("");
    setFormEmail("");
    setFormCity("Perundurai");
    setFormAreaLocality("");
    setFormDescription("");
    setFormGroupId(groups.length > 0 ? groups[0].id : "");
    setSelectedSuppliesMap({});
    setFormSupplySearch("");
    setContactModalOpen(true);
  }

  // Open Edit Contact Modal
  function openEditContact(c: NetworkContact) {
    setEditingContactId(c.id);
    setFormFirmName(c.firmName || "");
    setFormContactPerson(c.contactPerson);
    setFormPhone(c.phone);
    setFormEmail(c.email || "");
    setFormCity(c.city);
    setFormAreaLocality(c.areaLocality || "");
    setFormDescription(c.description || "");
    setFormGroupId(c.groupId || (groups.length > 0 ? groups[0].id : ""));

    // Populate existing supplies
    const initialMap: Record<
      string,
      { brandOrSpecs: string; standardRate: string; rateUnit: string; notes: string }
    > = {};
    for (const sup of c.supplies || []) {
      initialMap[sup.categoryId] = {
        brandOrSpecs: sup.brandOrSpecs || "",
        standardRate: sup.standardRate || "",
        rateUnit: sup.rateUnit || sup.defaultUnit || "per unit",
        notes: sup.notes || "",
      };
    }
    setSelectedSuppliesMap(initialMap);
    setFormSupplySearch("");
    setContactModalOpen(true);
  }

  // Toggle item in Contact Form
  function toggleSupplyItem(category: NetworkCategory) {
    setSelectedSuppliesMap((prev) => {
      const copy = { ...prev };
      if (copy[category.id]) {
        delete copy[category.id];
      } else {
        copy[category.id] = {
          brandOrSpecs: "",
          standardRate: "",
          rateUnit: category.defaultUnit || "per unit",
          notes: "",
        };
      }
      return copy;
    });
  }

  // Save Contact (Create or Edit)
  async function handleSaveContact(e: React.FormEvent) {
    e.preventDefault();
    if (!formContactPerson || !formPhone || !formCity) {
      alert("Please enter Contact Person Name, Primary Phone, and City.");
      return;
    }

    setSavingContact(true);

    const suppliesPayload = Object.entries(selectedSuppliesMap).map(
      ([categoryId, details]) => ({
        categoryId,
        brandOrSpecs: details.brandOrSpecs || null,
        standardRate: details.standardRate || null,
        rateUnit: details.rateUnit || null,
        notes: details.notes || null,
      })
    );

    const payload = {
      groupId: formGroupId || null,
      firmName: formFirmName.trim() || null,
      contactPerson: formContactPerson.trim(),
      phone: formPhone.trim(),
      email: formEmail.trim() || null,
      city: formCity.trim(),
      areaLocality: formAreaLocality.trim() || null,
      description: formDescription.trim() || null,
      supplies: suppliesPayload,
    };

    try {
      const url = editingContactId
        ? `/api/admin/network/contacts/${editingContactId}`
        : "/api/admin/network/contacts";
      const method = editingContactId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setContactModalOpen(false);
        fetchData();
      } else {
        alert(data.error || "Failed to save contact");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving contact");
    } finally {
      setSavingContact(false);
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

  // Legacy Group handlers
  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setSavingGroup(true);
    try {
      const res = await fetch("/api/admin/network/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newGroupName, description: newGroupDescription }),
      });
      if (res.ok) {
        setCreateGroupModalOpen(false);
        setNewGroupName("");
        setNewGroupDescription("");
        fetchData();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to create group");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating group");
    } finally {
      setSavingGroup(false);
    }
  }

  async function handleSaveEditGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!editingGroupId || !editGroupName.trim()) return;
    setSavingEditGroup(true);
    try {
      const res = await fetch(`/api/admin/network/groups/${editingGroupId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editGroupName, description: editGroupDesc }),
      });
      if (res.ok) {
        setEditGroupModalOpen(false);
        setEditingGroupId(null);
        fetchData();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to update group");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating group");
    } finally {
      setSavingEditGroup(false);
    }
  }

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

  // WhatsApp click handler
  function openWhatsApp(c: NetworkContact) {
    const cleanPhone = c.phone.replace(/\D/g, "");
    const supplyNames = (c.supplies || []).map((s) => s.categoryName).filter(Boolean).join(", ");
    const subject = supplyNames ? `regarding supply of ${supplyNames}` : `regarding construction works`;
    const msg = `Hello ${c.contactPerson}${c.firmName ? ` (${c.firmName})` : ""}, this is Kandhan Groups ${subject}.`;
    const url = cleanPhone
      ? `https://wa.me/91${cleanPhone.slice(-10)}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  }

  // Filter contacts by Department, Category, Group, City, and Search
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      // Filter by department
      if (selectedDepartment !== "ALL") {
        const hasDept = c.supplies?.some((s) => s.department === selectedDepartment);
        if (!hasDept) return false;
      }

      // Filter by category
      if (selectedCategoryId !== "ALL") {
        const hasCategory = c.supplies?.some((s) => s.categoryId === selectedCategoryId);
        if (!hasCategory) return false;
      }

      // Filter by group
      if (selectedGroupId !== "ALL" && c.groupId !== selectedGroupId) {
        return false;
      }

      // Filter by city
      if (cityFilter !== "ALL" && c.city.toLowerCase() !== cityFilter.toLowerCase()) {
        return false;
      }

      // Filter by search query
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const searchable = [
          c.contactPerson,
          c.firmName || "",
          c.phone,
          c.city,
          c.areaLocality || "",
          c.description || "",
          c.groupName || "",
          ...(c.supplies || []).map(
            (s) => `${s.categoryName || ""} ${s.aliases || ""} ${s.brandOrSpecs || ""}`
          ),
        ]
          .join(" ")
          .toLowerCase();

        if (!searchable.includes(q)) return false;
      }

      return true;
    });
  }, [contacts, selectedDepartment, selectedCategoryId, selectedGroupId, cityFilter, search]);

  // Operational civil hubs + dynamic cities from entered contacts
  const DEFAULT_OPERATIONAL_CITIES = [
    "Perundurai",
    "Erode",
    "Coimbatore",
    "Tiruppur",
    "Salem",
    "Karur",
    "Namakkal",
    "Bengaluru",
    "Chennai",
  ];

  const availableCities = useMemo(() => {
    const fromContacts = contacts.map((c) => c.city).filter(Boolean);
    const combined = Array.from(new Set([...DEFAULT_OPERATIONAL_CITIES, ...fromContacts]));
    return combined.sort((a, b) => {
      if (a === "Perundurai") return -1;
      if (b === "Perundurai") return 1;
      return a.localeCompare(b);
    });
  }, [contacts]);

  // Department counts
  const departmentCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: contacts.length,
      MATERIALS: 0,
      TRADES_LABOR: 0,
      EQUIPMENT: 0,
      SERVICES: 0,
    };
    for (const c of contacts) {
      const depts = new Set((c.supplies || []).map((s) => s.department));
      for (const d of depts) {
        if (d && counts[d] !== undefined) {
          counts[d]++;
        }
      }
    }
    return counts;
  }, [contacts]);

  // Categories belonging to active selected department
  const activeDepartmentCategories = useMemo(() => {
    if (selectedDepartment === "ALL") return categories;
    return categories.filter((cat) => cat.department === selectedDepartment);
  }, [categories, selectedDepartment]);

  // Categories filtered inside the contact modal
  const modalFilteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesDept = cat.department === formSupplyDeptTab;
      if (!matchesDept) return false;
      if (!formSupplySearch.trim()) return true;
      const q = formSupplySearch.toLowerCase().trim();
      return (
        cat.name.toLowerCase().includes(q) ||
        (cat.aliases && cat.aliases.toLowerCase().includes(q))
      );
    });
  }, [categories, formSupplyDeptTab, formSupplySearch]);

  const selectedSuppliesCount = Object.keys(selectedSuppliesMap).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BookUser className="w-6 h-6 text-amber-500" />
            Trade Network & Multi-Item Supplier Registry
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Directory of single & multi-item material suppliers, masonry gangs, equipment hirers, and civil consultants.
          </p>
        </div>

        {/* Standardized Primary Action Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5">
          <button
            suppressHydrationWarning
            onClick={() => {
              setCategoryModalMode("LIST");
              setManageCategoriesModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition shadow-xs cursor-pointer"
            title="Add, edit, or delete civil materials, trade items, and search aliases"
          >
            <Settings2 className="w-4 h-4 text-amber-600" />
            Manage Items & Aliases ({categories.length})
          </button>

          <button
            suppressHydrationWarning
            onClick={openCreateContact}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> + Add Trade Contact
          </button>
        </div>
      </div>

      {/* 2-LEVEL CIVIL NAVIGATOR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
        {/* LEVEL 1: BROAD CIVIL DEPARTMENTS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Layers className="w-4 h-4 text-amber-500" />
            <span>Civil Sectors</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              suppressHydrationWarning
              onClick={() => {
                setSelectedDepartment("ALL");
                setSelectedCategoryId("ALL");
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                selectedDepartment === "ALL"
                  ? "bg-slate-900 text-amber-400 shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              All Sectors ({departmentCounts.ALL})
            </button>

            {(Object.keys(DEPARTMENT_CONFIG) as DepartmentType[]).map((deptKey) => {
              const cfg = DEPARTMENT_CONFIG[deptKey];
              const Icon = cfg.icon;
              const isSelected = selectedDepartment === deptKey;
              return (
                <button
                  suppressHydrationWarning
                  key={deptKey}
                  onClick={() => {
                    setSelectedDepartment(deptKey);
                    setSelectedCategoryId("ALL");
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-amber-500 text-slate-950 shadow-xs font-extrabold"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cfg.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? "bg-slate-950 text-amber-400 font-mono"
                        : "bg-white text-slate-500 border border-slate-200 font-mono"
                    }`}
                  >
                    {departmentCounts[deptKey] || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* LEVEL 2: SPECIFIC ITEM PILLS (Cement, Steel, Jalli, M-Sand, Excavator, etc.) */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-2">
            <span>
              Specific Items / Materials{" "}
              {selectedDepartment !== "ALL" ? `in ${DEPARTMENT_CONFIG[selectedDepartment as DepartmentType]?.label}` : ""}
            </span>
            {selectedCategoryId !== "ALL" && (
              <button
                suppressHydrationWarning
                onClick={() => setSelectedCategoryId("ALL")}
                className="text-amber-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Clear item filter (Show all in {selectedDepartment === "ALL" ? "registry" : DEPARTMENT_CONFIG[selectedDepartment as DepartmentType]?.label})
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              suppressHydrationWarning
              onClick={() => setSelectedCategoryId("ALL")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition ${
                selectedCategoryId === "ALL"
                  ? "bg-slate-800 text-white font-bold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Items ({activeDepartmentCategories.length})
            </button>

            {activeDepartmentCategories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <button
                  suppressHydrationWarning
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                  title={cat.aliases ? `Search aliases: ${cat.aliases}` : undefined}
                >
                  <span>{cat.name}</span>
                  {cat.supplierCount > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isSelected
                          ? "bg-slate-900 text-amber-400"
                          : "bg-white text-slate-500 border border-slate-200"
                      }`}
                    >
                      {cat.supplierCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* FILTER & FAST SEARCH BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            suppressHydrationWarning
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search supplier, item name, aliases (jalli, kambi, m-sand), phone, city..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Operational Groups Filter */}
          <div className="flex items-center gap-1.5">
            <FolderTree className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              suppressHydrationWarning
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none font-medium cursor-pointer"
            >
              <option value="ALL">All Groups ({groups.length})</option>
              {groups.map((g) => {
                const count = contacts.filter((c) => c.groupId === g.id).length;
                return (
                  <option key={g.id} value={g.id}>
                    {g.name} {count > 0 ? `(${count})` : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Specific Supply Item / Material Filter */}
          <div className="flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              suppressHydrationWarning
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none font-medium cursor-pointer"
            >
              <option value="ALL">All Items ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} {cat.supplierCount > 0 ? `(${cat.supplierCount})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Proximity / City Filter */}
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              suppressHydrationWarning
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none font-medium cursor-pointer"
            >
              <option value="ALL">All Cities ({availableCities.length})</option>
              {availableCities.map((city) => {
                const count = contacts.filter((c) => c.city.toLowerCase() === city.toLowerCase()).length;
                return (
                  <option key={city} value={city}>
                    {city} {count > 0 ? `(${count})` : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button
              suppressHydrationWarning
              onClick={() => setViewMode("GRID")}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === "GRID"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              suppressHydrationWarning
              onClick={() => setViewMode("TABLE")}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === "TABLE"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MAIN DIRECTORY VIEW */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
          Loading trade registry...
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
          <BookUser className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <div className="text-sm font-bold text-slate-800">No matching contacts or suppliers found</div>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {search
              ? `No suppliers found matching "${search}". Try searching for regional aliases like "jalli", "kambi", "m-sand" or click "+ Add Trade Contact".`
              : 'Click "+ Add Trade Contact" to enter a supplier or subcontractor.'}
          </p>
          <button
            suppressHydrationWarning
            onClick={openCreateContact}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> + Add Trade Contact
          </button>
        </div>
      ) : viewMode === "GRID" ? (
        /* GRID / CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-amber-400 transition p-4 shadow-xs flex flex-col justify-between group"
            >
              <div>
                {/* Location & Legacy Group */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    <span>{c.city}</span>
                    {c.areaLocality && <span className="text-slate-400">• {c.areaLocality}</span>}
                  </div>

                  {c.groupName && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[120px]">
                      {c.groupName}
                    </span>
                  )}
                </div>

                {/* Firm & Contact Person */}
                <div className="mb-3">
                  <h3 className="font-extrabold text-slate-950 text-base leading-tight">
                    {c.firmName || c.contactPerson}
                  </h3>
                  {c.firmName && (
                    <div className="text-xs text-slate-600 font-semibold mt-0.5">
                      Contact: {c.contactPerson}
                    </div>
                  )}
                </div>

                {/* MULTI-ITEM SUPPLY TAGS (Visual Checkmark Pills) */}
                <div className="mb-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Supplies & Specializations ({c.supplies?.length || 0})</span>
                  </div>

                  {c.supplies && c.supplies.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {c.supplies.map((s, idx) => {
                        const deptCfg = s.department
                          ? DEPARTMENT_CONFIG[s.department]
                          : DEPARTMENT_CONFIG.MATERIALS;
                        return (
                          <div
                            key={s.id || idx}
                            className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 ${deptCfg.badge}`}
                          >
                            <Check className="w-3 h-3 text-slate-700 shrink-0" />
                            <span>{s.categoryName}</span>
                            {s.brandOrSpecs && (
                              <span className="text-[10px] font-normal text-slate-600">
                                ({s.brandOrSpecs})
                              </span>
                            )}
                            {s.standardRate && (
                              <span className="text-[10px] font-bold text-slate-900 bg-white/70 px-1 py-0.2 rounded">
                                {s.standardRate} {s.rateUnit ? `/ ${s.rateUnit}` : ""}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic">No supply items linked yet.</div>
                  )}
                </div>

                {/* Description & Remarks */}
                {c.description && (
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {c.description}
                  </p>
                )}
              </div>

              {/* Card Footer: WhatsApp, Call, View, Edit, Delete */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    suppressHydrationWarning
                    onClick={() => openWhatsApp(c)}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                    title="Send WhatsApp"
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
                    title="View Full Profile"
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
        /* TABLE VIEW */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-600 uppercase tracking-wider border-b border-slate-200 font-bold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Firm & Contact</th>
                  <th className="py-3 px-3 w-40">City / Location</th>
                  <th className="py-3 px-3 w-32">Phone</th>
                  <th className="py-3 px-4">Supplies & Specializations</th>
                  <th className="py-3 px-4">Remarks</th>
                  <th className="py-3 px-4 w-32 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContacts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-slate-900">{c.firmName || c.contactPerson}</div>
                      {c.firmName && (
                        <div className="text-[11px] text-slate-500">Contact: {c.contactPerson}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700 whitespace-nowrap">
                      {c.city}
                      {c.areaLocality && <div className="text-[10px] text-slate-500">{c.areaLocality}</div>}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-800 whitespace-nowrap">
                      {c.phone}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-sm">
                        {c.supplies && c.supplies.length > 0 ? (
                          c.supplies.map((s, idx) => (
                            <span
                              key={s.id || idx}
                              className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-bold"
                            >
                              ✓ {s.categoryName}
                              {s.standardRate && ` (${s.standardRate})`}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">-</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
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
                          title="View Profile"
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
      {/* ADD / EDIT CONTACT MODAL (WITH MULTI-ITEM TICK PILLS) */}
      {/* ======================================================== */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl text-slate-900 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                {editingContactId ? (
                  <>
                    <Edit3 className="w-5 h-5 text-amber-500" />
                    Edit Trade Contact & Supplies
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 text-amber-500" />
                    Add Trade Contact (Single or Multi-Item)
                  </>
                )}
              </h3>
              <button
                suppressHydrationWarning
                onClick={() => setContactModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-4">
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
                    placeholder="e.g. Kaveri Traders / Sri Balaji Cements"
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

              {/* ======================================================== */}
              {/* MULTI-ITEM SUPPLY SELECTOR WITH VISUAL TICK PILLS */}
              {/* ======================================================== */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-900">
                      What items or trades does this contact supply?
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Tick all that apply. Single vendor can supply multiple items (e.g. Cement + Steel + Sand).
                    </p>
                  </div>

                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={() => {
                      setInlineCatDept(formSupplyDeptTab);
                      setInlineCatModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Create New Item
                  </button>
                </div>

                {/* Sector Tabs inside Modal */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-2.5 text-xs">
                  {(Object.keys(DEPARTMENT_CONFIG) as DepartmentType[]).map((deptKey) => {
                    const cfg = DEPARTMENT_CONFIG[deptKey];
                    const isSelected = formSupplyDeptTab === deptKey;
                    return (
                      <button
                        suppressHydrationWarning
                        key={deptKey}
                        type="button"
                        onClick={() => setFormSupplyDeptTab(deptKey)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer ${
                          isSelected
                            ? "bg-slate-900 text-amber-400 shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>

                {/* Fast Item Filter Input */}
                <div className="relative mb-2.5">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={formSupplySearch}
                    onChange={(e) => setFormSupplySearch(e.target.value)}
                    placeholder="Filter items by name or alias (e.g. jalli, kambi, m-sand)..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Clickable Tick Pills */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl max-h-48 overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {modalFilteredCategories.map((cat) => {
                      const isTicked = Boolean(selectedSuppliesMap[cat.id]);
                      return (
                        <button
                          suppressHydrationWarning
                          key={cat.id}
                          type="button"
                          onClick={() => toggleSupplyItem(cat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            isTicked
                              ? "bg-amber-500 text-slate-950 border border-amber-600 shadow-xs"
                              : "bg-white text-slate-700 border border-slate-300 hover:border-slate-400"
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isTicked ? "bg-slate-950 text-amber-400" : "bg-slate-100 text-transparent border border-slate-300"
                            }`}
                          >
                            ✓
                          </span>
                          <span>{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Items Micro-Details (Optional brand, rate, unit) */}
                {selectedSuppliesCount > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-[11px] font-bold text-slate-700">
                      Selected Items ({selectedSuppliesCount}) - Optional Brand / Rate:
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {Object.keys(selectedSuppliesMap).map((catId) => {
                        const cat = categories.find((c) => c.id === catId);
                        const itemState = selectedSuppliesMap[catId];
                        if (!cat || !itemState) return null;

                        return (
                          <div
                            key={catId}
                            className="p-2.5 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                          >
                            <div className="font-bold text-slate-900 min-w-[140px] flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>{cat.name}</span>
                            </div>

                            <div className="flex items-center gap-2 flex-1">
                              <input
                                suppressHydrationWarning
                                type="text"
                                placeholder="Brand (e.g. UltraTech, JSW)"
                                value={itemState.brandOrSpecs}
                                onChange={(e) =>
                                  setSelectedSuppliesMap((prev) => ({
                                    ...prev,
                                    [catId]: { ...prev[catId], brandOrSpecs: e.target.value },
                                  }))
                                }
                                className="w-1/2 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                              />
                              <input
                                suppressHydrationWarning
                                type="text"
                                placeholder={`Rate (e.g. ₹380 / ${cat.defaultUnit || "bag"})`}
                                value={itemState.standardRate}
                                onChange={(e) =>
                                  setSelectedSuppliesMap((prev) => ({
                                    ...prev,
                                    [catId]: { ...prev[catId], standardRate: e.target.value },
                                  }))
                                }
                                className="w-1/2 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                              />
                            </div>

                            <button
                              suppressHydrationWarning
                              type="button"
                              onClick={() => toggleSupplyItem(cat)}
                              className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                              title="Remove item"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Remarks / Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  General Remarks / Site Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. Trusted supplier, supplies within 4 hours, credit terms available..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => setContactModalOpen(false)}
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
                  {savingContact ? "Saving..." : editingContactId ? "Save Changes" : "Save Trade Contact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* QUICK INLINE ITEM CREATE MODAL */}
      {/* ======================================================== */}
      {inlineCatModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-500" />
                Add New Civil Item / Category
              </h3>
              <button
                suppressHydrationWarning
                onClick={() => setInlineCatModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInlineCategory} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Item Name * (e.g. 6-inch Solid Blocks, UPVC Windows)
                </label>
                <input
                  suppressHydrationWarning
                  type="text"
                  required
                  value={inlineCatName}
                  onChange={(e) => setInlineCatName(e.target.value)}
                  placeholder="e.g. Paver Blocks, Waterproofing Chemical"
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sector</label>
                  <select
                    suppressHydrationWarning
                    value={inlineCatDept}
                    onChange={(e) => setInlineCatDept(e.target.value as DepartmentType)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none font-bold"
                  >
                    <option value="MATERIALS">Civil Materials</option>
                    <option value="TRADES_LABOR">Trades & Labor</option>
                    <option value="EQUIPMENT">Equipment & Rental</option>
                    <option value="SERVICES">Services & Engineers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Default Unit</label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={inlineCatUnit}
                    onChange={(e) => setInlineCatUnit(e.target.value)}
                    placeholder="e.g. per block, per sq.ft"
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Search Aliases (Local / Tamil names, separated by comma)
                </label>
                <input
                  suppressHydrationWarning
                  type="text"
                  value={inlineCatAliases}
                  onChange={(e) => setInlineCatAliases(e.target.value)}
                  placeholder="e.g. paver stone, thar block, interlock"
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Typing any of these words in search will immediately locate this item.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => setInlineCatModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  suppressHydrationWarning
                  type="submit"
                  disabled={savingInlineCat}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {savingInlineCat ? "Adding..." : "Add & Select"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MANAGE ITEMS & ALIASES MODAL (FULL CRUD) */}
      {/* ======================================================== */}
      {manageCategoriesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl text-slate-900 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-amber-500" />
                Manage Civil Items, Units & Regional Aliases ({categories.length})
              </h3>
              <button
                suppressHydrationWarning
                onClick={() => setManageCategoriesModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {categoryModalMode === "LIST" ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  {/* Sector Tabs inside Management Modal */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                    {(Object.keys(DEPARTMENT_CONFIG) as DepartmentType[]).map((deptKey) => {
                      const cfg = DEPARTMENT_CONFIG[deptKey];
                      const isSelected = categoryDeptTab === deptKey;
                      const count = categories.filter((c) => c.department === deptKey).length;
                      return (
                        <button
                          suppressHydrationWarning
                          key={deptKey}
                          onClick={() => setCategoryDeptTab(deptKey)}
                          className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer ${
                            isSelected
                              ? "bg-slate-900 text-amber-400 shadow-xs"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {cfg.label} ({count})
                        </button>
                      );
                    })}
                  </div>

                  <button
                    suppressHydrationWarning
                    onClick={() => {
                      setCatFormId("");
                      setCatFormDept(categoryDeptTab);
                      setCatFormName("");
                      setCatFormAliases("");
                      setCatFormUnit("per unit");
                      setCatFormDescription("");
                      setCategoryModalMode("CREATE");
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> + New Item
                  </button>
                </div>

                {/* Items Table for Selected Department */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Item Name</th>
                        <th className="py-2.5 px-3">Aliases (Search Slang)</th>
                        <th className="py-2.5 px-3 w-28">Default Unit</th>
                        <th className="py-2.5 px-3 w-20 text-center">Suppliers</th>
                        <th className="py-2.5 px-3 w-24 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {categories
                        .filter((c) => c.department === categoryDeptTab)
                        .map((cat) => (
                          <tr key={cat.id} className="hover:bg-slate-50 transition">
                            <td className="py-2.5 px-3 font-extrabold text-slate-900">
                              {cat.name}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate">
                              {cat.aliases || <span className="text-slate-300">-</span>}
                            </td>
                            <td className="py-2.5 px-3 text-slate-700 font-mono text-[11px]">
                              {cat.defaultUnit || "per unit"}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold font-mono text-[10px]">
                                {cat.supplierCount}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  suppressHydrationWarning
                                  onClick={() => {
                                    setCatFormId(cat.id);
                                    setCatFormDept(cat.department);
                                    setCatFormName(cat.name);
                                    setCatFormAliases(cat.aliases || "");
                                    setCatFormUnit(cat.defaultUnit || "per unit");
                                    setCatFormDescription(cat.description || "");
                                    setCategoryModalMode("EDIT");
                                  }}
                                  className="p-1 rounded text-amber-600 hover:bg-amber-50 cursor-pointer"
                                  title="Edit Item"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  suppressHydrationWarning
                                  onClick={() => setCategoryToDelete(cat)}
                                  className="p-1 rounded text-rose-600 hover:bg-rose-50 cursor-pointer"
                                  title="Delete Item"
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

                <div className="flex justify-end pt-3 border-t border-slate-200">
                  <button
                    suppressHydrationWarning
                    onClick={() => setManageCategoriesModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              /* CREATE / EDIT FORM */
              <form onSubmit={handleSaveCategory} className="space-y-4">
                <div className="text-xs font-bold text-slate-800">
                  {categoryModalMode === "EDIT" ? "Edit Civil Item" : "Create New Civil Item"}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Item Name *</label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    required
                    value={catFormName}
                    onChange={(e) => setCatFormName(e.target.value)}
                    placeholder="e.g. Cement (OPC / PPC), TMT Steel Rebars"
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Sector *</label>
                    <select
                      suppressHydrationWarning
                      value={catFormDept}
                      onChange={(e) => setCatFormDept(e.target.value as DepartmentType)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none font-bold"
                    >
                      <option value="MATERIALS">Civil Materials</option>
                      <option value="TRADES_LABOR">Trades & Labor</option>
                      <option value="EQUIPMENT">Equipment & Rental</option>
                      <option value="SERVICES">Services & Engineers</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Default Unit</label>
                    <input
                      suppressHydrationWarning
                      type="text"
                      value={catFormUnit}
                      onChange={(e) => setCatFormUnit(e.target.value)}
                      placeholder="e.g. per bag, per ton, per sq.ft"
                      className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Search Aliases (Local Tamil/regional words, separated by comma)
                  </label>
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={catFormAliases}
                    onChange={(e) => setCatFormAliases(e.target.value)}
                    placeholder="e.g. jalli, blue metal, 20mm, aggregate"
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    When someone types any of these words into the search bar, this item and its suppliers will appear.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={catFormDescription}
                    onChange={(e) => setCatFormDescription(e.target.value)}
                    placeholder="Specifications, notes, or grades..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={() => setCategoryModalMode("LIST")}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    suppressHydrationWarning
                    type="submit"
                    disabled={savingCategory}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {savingCategory ? "Saving..." : "Save Item"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CONFIRM DELETE CATEGORY MODAL */}
      {/* ======================================================== */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl text-slate-900">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Delete Item</h3>
                <p className="text-xs text-slate-500">Remove from civil items registry.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Are you sure you want to delete <strong className="text-slate-900">{categoryToDelete.name}</strong>?
              Suppliers who have this item tagged will lose this specific tag.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                suppressHydrationWarning
                type="button"
                onClick={handleConfirmDeleteCategory}
                disabled={deletingCategory}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 cursor-pointer disabled:opacity-50"
              >
                {deletingCategory ? "Deleting..." : "Yes, Delete Item"}
              </button>
            </div>
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
              </strong>
              ? All linked supply tags will also be removed.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => setDeleteContactModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
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
      {/* VIEW FULL CONTACT PROFILE MODAL */}
      {/* ======================================================== */}
      {viewContactModalOpen && activeContactView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-900 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 mb-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-extrabold text-slate-950 leading-tight">
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
                className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Phone & Location */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Primary Phone:</span>
                    <a href={`tel:${activeContactView.phone}`} className="font-bold text-slate-900 hover:underline">
                      {activeContactView.phone}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Location:</span>
                    <span className="font-bold text-slate-900">
                      {activeContactView.city}
                      {activeContactView.areaLocality ? ` (${activeContactView.areaLocality})` : ""}
                    </span>
                  </div>
                </div>
                {activeContactView.email && (
                  <div>
                    <span className="text-slate-400 block text-[11px]">Email:</span>
                    <a href={`mailto:${activeContactView.email}`} className="text-blue-600 hover:underline">
                      {activeContactView.email}
                    </a>
                  </div>
                )}
              </div>

              {/* SUPPLIED ITEMS LIST WITH SPECIFICATIONS */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Supplies & Trades ({activeContactView.supplies?.length || 0})
                </div>

                {activeContactView.supplies && activeContactView.supplies.length > 0 ? (
                  <div className="space-y-1.5">
                    {activeContactView.supplies.map((s, idx) => (
                      <div
                        key={s.id || idx}
                        className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-2"
                      >
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{s.categoryName}</span>
                          {s.brandOrSpecs && (
                            <span className="text-slate-500 font-normal">({s.brandOrSpecs})</span>
                          )}
                        </div>
                        {s.standardRate && (
                          <div className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {s.standardRate} {s.rateUnit ? `/ ${s.rateUnit}` : ""}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-400 italic">No supply items linked.</div>
                )}
              </div>

              {/* Remarks */}
              {activeContactView.description && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Remarks & Notes
                  </div>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {activeContactView.description}
                  </p>
                </div>
              )}

              {/* Actions Footer */}
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
