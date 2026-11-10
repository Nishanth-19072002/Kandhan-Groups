"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  FileSpreadsheet,
  Plus,
  Search,
  Printer,
  Share2,
  CheckCircle2,
  Trash2,
  X,
  FileCheck2,
  Building,
  Calendar,
  Eye,
  Edit3,
  User,
  Phone,
  AlertTriangle,
  Layers,
  ChevronDown,
  RefreshCw,
  FileText,
  GitBranch,
  TrendingUp,
  Receipt,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

interface QuotationItem {
  id: string;
  quoteNumber: string;
  currentRevision: number;
  status: string;
  createdAt: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
  companyName: string | null;
  enquiryId: string | null;
  workType: string | null;
  siteLocation: string | null;
  subtotal: number;
  totalCost: number;
  totalMargin: number;
  overallMarginPercent: number;
  negotiationNotes: string | null;
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  discountAmount: number;
  grandTotal: number;
  scopeOfWork: string | null;
  termsAndConditions: string | null;
  orderId: string | null;
  orderNumber: string | null;
  orderStatus: string | null;
  allRevisions?: {
    id: string;
    revisionNumber: number;
    grandTotal: number;
    subtotal: number;
    totalCost: number;
    totalMargin: number;
    overallMarginPercent: number;
    negotiationNotes: string | null;
    createdAt: string;
  }[];
}

interface LineItemRow {
  category: string;
  description: string;
  unit: string;
  quantity: number;
  costRate?: number; // Internal Estimated Cost Rate (₹)
  marginPercent?: number; // Margin % kept by contractor
  unitRate: number; // Client Quoted Unit Rate (₹)
  amount: number;
  hsnSacCode?: string;
  saveToMaster?: boolean;
}

export default function QuotationsPage() {
  const searchParams = useSearchParams();
  const preselectedEnquiryId = searchParams.get("enquiryId");
  const preselectedQuoteId = searchParams.get("quoteId");

  const [quotations, setQuotations] = useState<QuotationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [clientFilter, setClientFilter] = useState("ALL");

  // Clients list for dropdowns
  const [clientsList, setClientsList] = useState<{ id: string; name: string; phone: string; companyName: string | null }[]>([]);
  // Enquiries list for linking
  const [enquiriesList, setEnquiriesList] = useState<{ id: string; clientId: string; workType: string; siteLocation: string; status: string; remarks?: string | null; description?: string | null }[]>([]);

  // Master items and bank registry state
  const [masterCatalog, setMasterCatalog] = useState<
    { id: string; category: string; itemName: string; description: string; unit: string; standardRate: number; hsnSacCode: string }[]
  >([]);
  const [companyBanks, setCompanyBanks] = useState<
    { id: string; accountNickname: string; bankName: string; accountNumber: string; ifscCode: string; branch: string; isDefault: boolean }[]
  >([]);
  const [selectedBankId, setSelectedBankId] = useState("");
  const [editBankId, setEditBankId] = useState("");
  const [reviseBankId, setReviseBankId] = useState("");

  // Create Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedEnquiryId, setSelectedEnquiryId] = useState(preselectedEnquiryId || "");
  const [scopeOfWork, setScopeOfWork] = useState("");
  const [gstRate, setGstRate] = useState(18);
  const [discountAmount, setDiscountAmount] = useState(0);

  const initialItem: LineItemRow = {
    category: "Civil Works",
    description: "",
    unit: "sq.ft",
    quantity: 1,
    costRate: 0,
    marginPercent: 20,
    unitRate: 0,
    amount: 0,
    hsnSacCode: "9954",
  };

  const [items, setItems] = useState<LineItemRow[]>([initialItem]);

  // Quick Edit Modal State (In-place edit without bumping revision number)
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [editingQuoteNumber, setEditingQuoteNumber] = useState("");
  const [editClientId, setEditClientId] = useState("");
  const [editStatus, setEditStatus] = useState("DRAFT");
  const [editScopeOfWork, setEditScopeOfWork] = useState("");
  const [editTermsAndConditions, setEditTermsAndConditions] = useState("");
  const [editGstRate, setEditGstRate] = useState(18);
  const [editDiscountAmount, setEditDiscountAmount] = useState(0);
  const [editItems, setEditItems] = useState<LineItemRow[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);
  const [loadingEditDetails, setLoadingEditDetails] = useState(false);

  // Revise Modal State (Creates formal R1 -> R2 -> R3 with negotiation notes)
  const [reviseModalOpen, setReviseModalOpen] = useState(false);
  const [revisingQuoteId, setRevisingQuoteId] = useState<string | null>(null);
  const [revisingQuoteNumber, setRevisingQuoteNumber] = useState("");
  const [nextRevNum, setNextRevNum] = useState(2);
  const [negotiationNotes, setNegotiationNotes] = useState("");
  const [reviseScopeOfWork, setReviseScopeOfWork] = useState("");
  const [reviseTermsAndConditions, setReviseTermsAndConditions] = useState("");
  const [reviseGstRate, setReviseGstRate] = useState(18);
  const [reviseDiscountAmount, setReviseDiscountAmount] = useState(0);
  const [reviseItems, setReviseItems] = useState<LineItemRow[]>([]);
  const [savingRevision, setSavingRevision] = useState(false);

  // View / Print Modal State
  const [activeQuote, setActiveQuote] = useState<any>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<QuotationItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Confirm / Work Order Modal State
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [quoteToConfirm, setQuoteToConfirm] = useState<QuotationItem | null>(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [expectedCompletionDate, setExpectedCompletionDate] = useState("");
  const [advanceAgreed, setAdvanceAgreed] = useState("");
  const [clientPoRef, setClientPoRef] = useState("");
  const [confirming, setConfirming] = useState(false);

  // Work Order Generated Success Modal
  const [orderSuccessModal, setOrderSuccessModal] = useState<{
    open: boolean;
    orderNumber: string;
    orderId: string;
    contractValue: number;
    quoteNumber: string;
  }>({ open: false, orderNumber: "", orderId: "", contractValue: 0, quoteNumber: "" });

  useEffect(() => {
    fetchQuotations();
    fetchClientsAndEnquiries();
    fetchMasterAndBanks();
  }, []);

  async function fetchMasterAndBanks() {
    try {
      const [mRes, bRes] = await Promise.all([
        fetch("/api/admin/master-items"),
        fetch("/api/admin/banks"),
      ]);
      const mData = await mRes.json();
      const bData = await bRes.json();
      if (mRes.ok && mData.items) {
        setMasterCatalog(mData.items);
      }
      if (bRes.ok && bData.banks) {
        setCompanyBanks(bData.banks);
        const def = bData.banks.find((b: any) => b.isDefault);
        if (def) {
          setSelectedBankId(def.id);
          setEditBankId(def.id);
          setReviseBankId(def.id);
        } else if (bData.banks.length > 0) {
          setSelectedBankId(bData.banks[0].id);
          setEditBankId(bData.banks[0].id);
          setReviseBankId(bData.banks[0].id);
        }
      }
    } catch (err) {
      console.error("Error loading master items and banks:", err);
    }
  }

  function handleSelectMasterItem(idx: number, masterId: string, targetType: "CREATE" | "EDIT" | "REVISE" = "CREATE") {
    const found = masterCatalog.find((m) => m.id === masterId);
    if (!found) return;

    const rate = Number(found.standardRate) || 0;
    const cost = Math.round(rate * 0.8 * 100) / 100; // 20% margin default estimate
    const margin = 20;

    const applyItem = (current: LineItemRow): LineItemRow => {
      const qty = Number(current.quantity) || 1;
      return {
        ...current,
        category: found.category || "Civil Works",
        description: found.description || found.itemName,
        unit: found.unit || "sq.ft",
        costRate: cost,
        marginPercent: margin,
        unitRate: rate,
        amount: Math.round(qty * rate * 100) / 100,
        hsnSacCode: found.hsnSacCode || "9954",
      };
    };

    if (targetType === "CREATE") {
      const updated = [...items];
      updated[idx] = applyItem(updated[idx]);
      setItems(updated);
    } else if (targetType === "EDIT") {
      const updated = [...editItems];
      updated[idx] = applyItem(updated[idx]);
      setEditItems(updated);
    } else if (targetType === "REVISE") {
      const updated = [...reviseItems];
      updated[idx] = applyItem(updated[idx]);
      setReviseItems(updated);
    }
  }

  async function fetchQuotations() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/quotations");
      const data = await res.json();
      if (res.ok && data.quotations) {
        setQuotations(data.quotations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchClientsAndEnquiries() {
    try {
      const [cRes, eRes] = await Promise.all([
        fetch("/api/admin/clients"),
        fetch("/api/admin/enquiries"),
      ]);
      const cData = await cRes.json();
      const eData = await eRes.json();

      let loadedClients: any[] = [];
      let loadedEnquiries: any[] = [];

      if (cRes.ok && cData.clients) {
        loadedClients = cData.clients;
        setClientsList(cData.clients);
      }

      if (eRes.ok && eData.enquiries) {
        loadedEnquiries = eData.enquiries;
        setEnquiriesList(eData.enquiries);
      }

      // Check if opened via URL param ?enquiryId=xxx
      if (preselectedEnquiryId && loadedEnquiries.length > 0) {
        const matchedEnq = loadedEnquiries.find((e: any) => e.id === preselectedEnquiryId);
        if (matchedEnq) {
          setSelectedClientId(matchedEnq.clientId);
          setSelectedEnquiryId(matchedEnq.id);
          if (matchedEnq.workType) {
            setScopeOfWork(`${matchedEnq.workType} — ${matchedEnq.siteLocation || "Site as agreed"}`);
          }
          setCreateModalOpen(true);
        }
      } else if (loadedClients.length > 0 && !selectedClientId) {
        setSelectedClientId(loadedClients[0].id);
      }

      // Direct view if ?quoteId=xxx passed
      if (preselectedQuoteId) {
        openViewQuote(preselectedQuoteId);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // ==========================================
  // Item Change Handlers with Margin Calculations
  // ==========================================
  function handleItemChange(idx: number, field: keyof LineItemRow, val: any) {
    const updated = [...items];
    (updated[idx] as any)[field] = val;

    let cost = Number(field === "costRate" ? val : updated[idx].costRate) || 0;
    let margin = Number(field === "marginPercent" ? val : updated[idx].marginPercent) || 0;
    let rate = Number(field === "unitRate" ? val : updated[idx].unitRate) || 0;
    const qty = Number(field === "quantity" ? val : updated[idx].quantity) || 0;

    if (field === "costRate" || field === "marginPercent") {
      if (cost > 0) {
        rate = Math.round(cost * (1 + margin / 100) * 100) / 100;
        updated[idx].unitRate = rate;
      }
    } else if (field === "unitRate") {
      if (cost > 0) {
        margin = Math.round(((rate - cost) / cost) * 100 * 10) / 10;
        updated[idx].marginPercent = margin;
      }
    }

    updated[idx].amount = Math.round(qty * rate * 100) / 100;
    setItems(updated);
  }

  function addItemRow() {
    setItems([
      ...items,
      {
        category: "Civil Works",
        description: "",
        unit: "sq.ft",
        quantity: 1,
        costRate: 0,
        marginPercent: 20,
        unitRate: 0,
        amount: 0,
        hsnSacCode: "9954",
      },
    ]);
  }

  // FIXED: 1st Item can be deleted or cleared without restrictions!
  function removeItemRow(idx: number) {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== idx));
    } else {
      setItems([
        {
          category: "",
          description: "",
          unit: "sq.ft",
          quantity: 1,
          costRate: 0,
          marginPercent: 20,
          unitRate: 0,
          amount: 0,
          hsnSacCode: "9954",
        },
      ]);
    }
  }

  const subtotal = items.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
  const totalCost = items.reduce((acc, it) => acc + (Number(it.costRate || 0) * Number(it.quantity || 0)), 0);
  const totalMargin = Math.round((subtotal - totalCost) * 100) / 100;
  const overallMarginPercent = totalCost > 0 ? Math.round((totalMargin / totalCost) * 100 * 10) / 10 : 0;
  const netTaxable = Math.max(0, subtotal - (Number(discountAmount) || 0));
  const gstAmount = Math.round(netTaxable * (Number(gstRate) / 100));
  const grandTotal = Math.round(netTaxable + gstAmount);

  // Edit Calculation helpers
  function handleEditItemChange(idx: number, field: keyof LineItemRow, val: any) {
    const updated = [...editItems];
    (updated[idx] as any)[field] = val;

    let cost = Number(field === "costRate" ? val : updated[idx].costRate) || 0;
    let margin = Number(field === "marginPercent" ? val : updated[idx].marginPercent) || 0;
    let rate = Number(field === "unitRate" ? val : updated[idx].unitRate) || 0;
    const qty = Number(field === "quantity" ? val : updated[idx].quantity) || 0;

    if (field === "costRate" || field === "marginPercent") {
      if (cost > 0) {
        rate = Math.round(cost * (1 + margin / 100) * 100) / 100;
        updated[idx].unitRate = rate;
      }
    } else if (field === "unitRate") {
      if (cost > 0) {
        margin = Math.round(((rate - cost) / cost) * 100 * 10) / 10;
        updated[idx].marginPercent = margin;
      }
    }

    updated[idx].amount = Math.round(qty * rate * 100) / 100;
    setEditItems(updated);
  }

  function addEditItemRow() {
    setEditItems([
      ...editItems,
      {
        category: "Civil Works",
        description: "",
        unit: "sq.ft",
        quantity: 1,
        costRate: 0,
        marginPercent: 20,
        unitRate: 0,
        amount: 0,
        hsnSacCode: "9954",
      },
    ]);
  }

  function removeEditItemRow(idx: number) {
    if (editItems.length > 1) {
      setEditItems(editItems.filter((_, i) => i !== idx));
    } else {
      setEditItems([
        {
          category: "",
          description: "",
          unit: "sq.ft",
          quantity: 1,
          costRate: 0,
          marginPercent: 20,
          unitRate: 0,
          amount: 0,
          hsnSacCode: "9954",
        },
      ]);
    }
  }

  const editSubtotal = editItems.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
  const editTotalCost = editItems.reduce((acc, it) => acc + (Number(it.costRate || 0) * Number(it.quantity || 0)), 0);
  const editTotalMargin = Math.round((editSubtotal - editTotalCost) * 100) / 100;
  const editOverallMarginPercent = editTotalCost > 0 ? Math.round((editTotalMargin / editTotalCost) * 100 * 10) / 10 : 0;
  const editNetTaxable = Math.max(0, editSubtotal - (Number(editDiscountAmount) || 0));
  const editGstAmount = Math.round(editNetTaxable * (Number(editGstRate) / 100));
  const editGrandTotal = Math.round(editNetTaxable + editGstAmount);

  // Revise Calculation helpers
  function handleReviseItemChange(idx: number, field: keyof LineItemRow, val: any) {
    const updated = [...reviseItems];
    (updated[idx] as any)[field] = val;

    let cost = Number(field === "costRate" ? val : updated[idx].costRate) || 0;
    let margin = Number(field === "marginPercent" ? val : updated[idx].marginPercent) || 0;
    let rate = Number(field === "unitRate" ? val : updated[idx].unitRate) || 0;
    const qty = Number(field === "quantity" ? val : updated[idx].quantity) || 0;

    if (field === "costRate" || field === "marginPercent") {
      if (cost > 0) {
        rate = Math.round(cost * (1 + margin / 100) * 100) / 100;
        updated[idx].unitRate = rate;
      }
    } else if (field === "unitRate") {
      if (cost > 0) {
        margin = Math.round(((rate - cost) / cost) * 100 * 10) / 10;
        updated[idx].marginPercent = margin;
      }
    }

    updated[idx].amount = Math.round(qty * rate * 100) / 100;
    setReviseItems(updated);
  }

  function addReviseItemRow() {
    setReviseItems([
      ...reviseItems,
      {
        category: "Civil Works",
        description: "",
        unit: "sq.ft",
        quantity: 1,
        costRate: 0,
        marginPercent: 20,
        unitRate: 0,
        amount: 0,
        hsnSacCode: "9954",
      },
    ]);
  }

  function removeReviseItemRow(idx: number) {
    if (reviseItems.length > 1) {
      setReviseItems(reviseItems.filter((_, i) => i !== idx));
    } else {
      setReviseItems([
        {
          category: "",
          description: "",
          unit: "sq.ft",
          quantity: 1,
          costRate: 0,
          marginPercent: 20,
          unitRate: 0,
          amount: 0,
          hsnSacCode: "9954",
        },
      ]);
    }
  }

  const reviseSubtotal = reviseItems.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
  const reviseTotalCost = reviseItems.reduce((acc, it) => acc + (Number(it.costRate || 0) * Number(it.quantity || 0)), 0);
  const reviseTotalMargin = Math.round((reviseSubtotal - reviseTotalCost) * 100) / 100;
  const reviseOverallMarginPercent = reviseTotalCost > 0 ? Math.round((reviseTotalMargin / reviseTotalCost) * 100 * 10) / 10 : 0;
  const reviseNetTaxable = Math.max(0, reviseSubtotal - (Number(reviseDiscountAmount) || 0));
  const reviseGstAmount = Math.round(reviseNetTaxable * (Number(reviseGstRate) / 100));
  const reviseGrandTotal = Math.round(reviseNetTaxable + reviseGstAmount);

  // ==========================================
  // Form Submit Handlers
  // ==========================================

  // Create Quote submit
  async function handleCreateQuotation(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch("/api/admin/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClientId,
          enquiryId: selectedEnquiryId || null,
          bankAccountId: selectedBankId || null,
          scopeOfWork,
          gstRate,
          discountAmount,
          items,
        }),
      });

      if (res.ok) {
        setCreateModalOpen(false);
        fetchQuotations();
        fetchMasterAndBanks();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  }

  // Open Quick Edit Modal (In-place)
  async function openEditQuote(quote: QuotationItem) {
    setEditingQuoteId(quote.id);
    setEditingQuoteNumber(quote.quoteNumber);
    setEditClientId(quote.clientId);
    setEditStatus(quote.status);
    setEditGstRate(quote.gstRate || 18);
    setEditDiscountAmount(quote.discountAmount || 0);
    setEditScopeOfWork(quote.scopeOfWork || "");
    setEditTermsAndConditions(quote.termsAndConditions || "");
    setEditModalOpen(true);
    setLoadingEditDetails(true);

    try {
      const res = await fetch(`/api/admin/quotations/${quote.id}`);
      const data = await res.json();
      if (res.ok && data) {
        if (data.items && data.items.length > 0) {
          setEditItems(
            data.items.map((it: any) => ({
              category: it.category || "Civil Works",
              description: it.description || "",
              unit: it.unit || "sq.ft",
              quantity: it.quantity || 1,
              costRate: it.costRate || Math.round((it.unitRate || 0) * 0.8),
              marginPercent: it.marginPercent !== undefined ? it.marginPercent : 20,
              unitRate: it.unitRate || 0,
              amount: it.amount || 0,
              hsnSacCode: it.hsnSacCode || "9954",
            }))
          );
        } else {
          setEditItems([initialItem]);
        }
        if (data.activeRevision) {
          setEditScopeOfWork(data.activeRevision.scopeOfWork || "");
          setEditTermsAndConditions(data.activeRevision.termsAndConditions || "");
          setEditGstRate(data.activeRevision.gstRate || 18);
          setEditDiscountAmount(data.activeRevision.discountAmount || 0);
          if (data.activeRevision.bankAccountId) {
            setEditBankId(data.activeRevision.bankAccountId);
          }
        }
      }
    } catch (err) {
      console.error("Error loading quote details for edit:", err);
    } finally {
      setLoadingEditDetails(false);
    }
  }

  // Submit Quick Edit (In-place)
  async function handleSaveEditQuotation(e: React.FormEvent) {
    e.preventDefault();
    if (!editingQuoteId) return;
    setSavingEdit(true);

    try {
      const res = await fetch(`/api/admin/quotations/${editingQuoteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: editClientId,
          status: editStatus,
          bankAccountId: editBankId || null,
          scopeOfWork: editScopeOfWork,
          termsAndConditions: editTermsAndConditions,
          gstRate: editGstRate,
          discountAmount: editDiscountAmount,
          items: editItems,
        }),
      });

      if (res.ok) {
        setEditModalOpen(false);
        setEditingQuoteId(null);
        fetchQuotations();
        fetchMasterAndBanks();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to update quotation");
      }
    } catch (err) {
      console.error("Error saving quotation:", err);
      alert("Error saving quotation. Check console for details.");
    } finally {
      setSavingEdit(false);
    }
  }

  // Open Revise Modal (R+1 with negotiation history)
  async function openReviseQuote(quote: QuotationItem) {
    setRevisingQuoteId(quote.id);
    setRevisingQuoteNumber(quote.quoteNumber);
    setNextRevNum((quote.currentRevision || 1) + 1);
    setNegotiationNotes("");
    setReviseScopeOfWork(quote.scopeOfWork || "");
    setReviseTermsAndConditions(quote.termsAndConditions || "");
    setReviseGstRate(quote.gstRate || 18);
    setReviseDiscountAmount(quote.discountAmount || 0);
    setReviseModalOpen(true);

    try {
      const res = await fetch(`/api/admin/quotations/${quote.id}`);
      const data = await res.json();
      if (res.ok && data) {
        if (data.items && data.items.length > 0) {
          setReviseItems(
            data.items.map((it: any) => ({
              category: it.category || "Civil Works",
              description: it.description || "",
              unit: it.unit || "sq.ft",
              quantity: it.quantity || 1,
              costRate: it.costRate || Math.round((it.unitRate || 0) * 0.8),
              marginPercent: it.marginPercent !== undefined ? it.marginPercent : 20,
              unitRate: it.unitRate || 0,
              amount: it.amount || 0,
              hsnSacCode: it.hsnSacCode || "9954",
            }))
          );
        }
        if (data.activeRevision) {
          setReviseScopeOfWork(data.activeRevision.scopeOfWork || "");
          setReviseTermsAndConditions(data.activeRevision.termsAndConditions || "");
          setReviseGstRate(data.activeRevision.gstRate || 18);
          setReviseDiscountAmount(data.activeRevision.discountAmount || 0);
          if (data.activeRevision.bankAccountId) {
            setReviseBankId(data.activeRevision.bankAccountId);
          }
        }
      }
    } catch (err) {
      console.error("Error loading quote for revision:", err);
    }
  }

  // Submit Revision (R+1)
  async function handleSaveRevision(e: React.FormEvent) {
    e.preventDefault();
    if (!revisingQuoteId) return;
    setSavingRevision(true);

    try {
      const res = await fetch(`/api/admin/quotations/${revisingQuoteId}/revise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          negotiationNotes: negotiationNotes.trim() || `Revision ${nextRevNum} agreed upon client discussions.`,
          scopeOfWork: reviseScopeOfWork,
          termsAndConditions: reviseTermsAndConditions,
          bankAccountId: reviseBankId || null,
          gstRate: reviseGstRate,
          discountAmount: reviseDiscountAmount,
          items: reviseItems,
        }),
      });

      if (res.ok) {
        setReviseModalOpen(false);
        setRevisingQuoteId(null);
        fetchQuotations();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to create revision");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating revision");
    } finally {
      setSavingRevision(false);
    }
  }

  // Open Delete modal
  function openDeleteQuote(quote: QuotationItem) {
    setQuoteToDelete(quote);
    setDeleteError("");
    setDeleteModalOpen(true);
  }

  // Confirm Delete
  async function handleConfirmDelete() {
    if (!quoteToDelete) return;
    setDeleting(true);
    setDeleteError("");

    try {
      const res = await fetch(`/api/admin/quotations/${quoteToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        setDeleteModalOpen(false);
        setQuoteToDelete(null);
        fetchQuotations();
      } else {
        setDeleteError(data.error || "Failed to delete quotation");
      }
    } catch (err) {
      console.error(err);
      setDeleteError("Network error while deleting quotation");
    } finally {
      setDeleting(false);
    }
  }

  // Open View Quote Letterhead (Supports viewing any past revision R1, R2, R3)
  async function openViewQuote(quoteId: string, revNum?: number) {
    setViewModalOpen(true);
    setLoadingDetails(true);
    try {
      const url = revNum
        ? `/api/admin/quotations/${quoteId}?revision=${revNum}`
        : `/api/admin/quotations/${quoteId}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setActiveQuote(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  }

  // Confirm Work Order Submit
  async function handleConfirmWorkOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!quoteToConfirm) return;
    setConfirming(true);

    try {
      const res = await fetch(`/api/admin/quotations/${quoteToConfirm.id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientPoReference: clientPoRef,
          startDate,
          expectedCompletionDate,
          advanceAgreed,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to confirm quotation and create work order.");
        return;
      }

      setConfirmModalOpen(false);
      // Trigger executive success modal with direct links!
      setOrderSuccessModal({
        open: true,
        orderNumber: data.orderNumber,
        orderId: data.orderId,
        contractValue: data.contractValue || quoteToConfirm.grandTotal,
        quoteNumber: quoteToConfirm.quoteNumber,
      });
      setQuoteToConfirm(null);
      await fetchQuotations();
    } catch (err: unknown) {
      console.error(err);
      alert("Network error while confirming work order.");
    } finally {
      setConfirming(false);
    }
  }

  function shareQuoteWhatsApp(q: any) {
    const text = encodeURIComponent(
      `*Kandhan Groups — Quotation Summary*\n` +
        `Quotation No: ${q.quotation.quoteNumber} (Rev ${q.activeRevision.revisionNumber})\n` +
        `Client: ${q.quotation.clientName} (${q.quotation.companyName || "Direct"})\n` +
        `Site Location: ${q.quotation.siteLocation || "As agreed"}\n` +
        `Subtotal: ₹${Number(q.activeRevision.subtotal).toLocaleString("en-IN")}\n` +
        `GST (18%): ₹${Math.round(Number(q.activeRevision.cgstAmount) + Number(q.activeRevision.sgstAmount)).toLocaleString("en-IN")}\n` +
        `*Grand Total: ₹${Number(q.activeRevision.grandTotal).toLocaleString("en-IN")}*\n\n` +
        `Civil Construction • Industrial Infrastructure • PMC`
    );
    const cleanPhone = (q.quotation.clientPhone || "").replace(/\D/g, "");
    const url = cleanPhone
      ? `https://wa.me/91${cleanPhone.slice(-10)}?text=${text}`
      : `https://wa.me/?text=${text}`;
    window.open(url, "_blank");
  }

  // Filter quotations
  const filteredQuotations = quotations.filter((q) => {
    const matchesSearch =
      q.quoteNumber.toLowerCase().includes(search.toLowerCase()) ||
      q.clientName.toLowerCase().includes(search.toLowerCase()) ||
      (q.companyName && q.companyName.toLowerCase().includes(search.toLowerCase())) ||
      (q.orderNumber && q.orderNumber.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || q.status === statusFilter;
    const matchesClient = clientFilter === "ALL" || q.clientId === clientFilter;

    return matchesSearch && matchesStatus && matchesClient;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-amber-500" />
            Quotations & Revisions Suite
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Commercial BOQ estimates, internal profit margin intelligence, revision tracking (R1, R2, R3), and legal work order conversions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            suppressHydrationWarning
            onClick={() => {
              setItems([initialItem]);
              setCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create New Quotation
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              suppressHydrationWarning
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search quote #, client, company, work order #..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2.5">
            {/* Client Filter */}
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-400" />
              <select
                suppressHydrationWarning
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              >
                <option value="ALL">All Clients ({clientsList.length})</option>
                {clientsList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.companyName ? `(${c.companyName})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mr-1">Status:</span>
          {[
            { val: "ALL", label: "All Quotes" },
            { val: "DRAFT", label: "Drafts" },
            { val: "SENT_TO_CLIENT", label: "Sent" },
            { val: "REVISED", label: "Revised" },
            { val: "CONFIRMED", label: "Confirmed" },
          ].map((opt) => (
            <button
              suppressHydrationWarning
              key={opt.val}
              onClick={() => setStatusFilter(opt.val)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition shrink-0 ${
                statusFilter === opt.val
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quotations Table */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
          Loading quotations...
        </div>
      ) : filteredQuotations.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
          <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <div className="text-sm font-bold text-slate-800">No quotations found</div>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Click &quot;Create New Quotation&quot; to build an itemized estimate with automatic 18% GST calculation.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-600 uppercase tracking-wider border-b border-slate-200 font-bold text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 w-36">Quote # & Revisions</th>
                  <th className="py-3.5 px-4">Client & Project</th>
                  <th className="py-3.5 px-3 w-36 text-right">Quoted Value</th>
                  <th className="py-3.5 px-3 w-40 text-right">Internal Margin</th>
                  <th className="py-3.5 px-3 w-36 text-center">Status / Work Order</th>
                  <th className="py-3.5 px-4 w-48 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuotations.map((q) => {
                  const isConfirmed = q.status === "CONFIRMED";
                  return (
                    <tr key={q.id} className="hover:bg-slate-50 transition group">
                      {/* Quote Number & Revisions */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            suppressHydrationWarning
                            onClick={() => openViewQuote(q.id)}
                            className="font-mono font-black text-slate-900 hover:text-amber-600 text-sm cursor-pointer"
                          >
                            {q.quoteNumber}
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(q.createdAt).toLocaleDateString()}
                        </div>

                        {/* Revision History Pills (R1, R2, R3) */}
                        {q.allRevisions && q.allRevisions.length > 0 && (
                          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                            {q.allRevisions.map((r: any) => (
                              <button
                                suppressHydrationWarning
                                key={r.revisionNumber}
                                onClick={() => openViewQuote(q.id, r.revisionNumber)}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${
                                  r.revisionNumber === q.currentRevision
                                    ? "bg-amber-500 text-slate-950 font-black shadow-2xs"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                                title={`Rev ${r.revisionNumber} (₹${Number(r.grandTotal).toLocaleString("en-IN")}) — ${r.negotiationNotes || "No notes"}`}
                              >
                                R{r.revisionNumber}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Client & Project */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 text-sm">{q.clientName}</div>
                        {q.companyName && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3 text-amber-500 shrink-0" />
                            <span className="truncate max-w-xs">{q.companyName}</span>
                          </div>
                        )}
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          {q.siteLocation ? `📍 ${q.siteLocation}` : q.clientPhone}
                        </div>
                      </td>

                      {/* Quoted Total Value */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="font-black text-amber-600 text-sm">
                          ₹{Number(q.grandTotal).toLocaleString("en-IN")}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Net: ₹{Number(q.subtotal).toLocaleString("en-IN")} + GST
                        </div>
                      </td>

                      {/* Internal Margin (Hidden on letterhead / PDF) */}
                      <td className="py-3.5 px-3 text-right">
                        {q.totalMargin > 0 ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold">
                              <TrendingUp className="w-3 h-3 text-emerald-600" />
                              +{q.overallMarginPercent}% (₹{Math.round(q.totalMargin).toLocaleString("en-IN")})
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Base Cost: ₹{Math.round(q.totalCost).toLocaleString("en-IN")}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px] italic">Margin not set</span>
                        )}
                      </td>

                      {/* Status / Confirmed Work Order Badge */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              q.status === "CONFIRMED"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : q.status === "REVISED"
                                ? "bg-purple-50 text-purple-800 border-purple-200"
                                : q.status === "SENT_TO_CLIENT"
                                ? "bg-blue-50 text-blue-800 border-blue-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            {q.status}
                          </span>

                          {/* Clickable Work Order Link */}
                          {q.orderNumber && (
                            <Link
                              href={`/admin/orders?orderId=${q.orderId}`}
                              className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 hover:text-emerald-800 underline mt-0.5"
                              title="Open confirmed Work Order"
                            >
                              <FileCheck2 className="w-3 h-3" /> {q.orderNumber}
                            </Link>
                          )}
                        </div>
                      </td>

                      {/* Actions: View, Quick Edit, Revise R+1, Confirm, Delete */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Letterhead */}
                          <button
                            suppressHydrationWarning
                            onClick={() => openViewQuote(q.id)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            title="View & Print Official Quotation"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Edit (In-place edit) */}
                          <button
                            suppressHydrationWarning
                            onClick={() => openEditQuote(q)}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition cursor-pointer"
                            title="Quick Edit (Current Revision)"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Revise Quote (Create R1 -> R2 with negotiation log) */}
                          <button
                            suppressHydrationWarning
                            onClick={() => openReviseQuote(q)}
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition cursor-pointer"
                            title="Revise Quotation (Create Next Revision R+1)"
                          >
                            <GitBranch className="w-3.5 h-3.5" />
                          </button>

                          {/* Confirm Order / Issue Work Order */}
                          {!isConfirmed ? (
                            <button
                              suppressHydrationWarning
                              onClick={() => {
                                setQuoteToConfirm(q);
                                setAdvanceAgreed(String(Math.round(q.grandTotal * 0.25)));
                                setConfirmModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition cursor-pointer"
                              title="Confirm Quote & Generate Work Order"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            /* Shortcuts for Confirmed Quotes: Proforma PI & Tax Invoice */
                            <div className="flex items-center gap-1">
                              <Link
                                href={`/admin/invoices?orderId=${q.orderId}&type=PROFORMA`}
                                className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition"
                                title="Issue Proforma Invoice (PI)"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </Link>
                              <Link
                                href={`/admin/invoices?orderId=${q.orderId}&type=TAX_INVOICE`}
                                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition"
                                title="Issue GST Tax Invoice"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          )}

                          {/* Delete */}
                          <button
                            suppressHydrationWarning
                            onClick={() => openDeleteQuote(q)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition cursor-pointer"
                            title="Delete Quotation"
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
      {/* WORK ORDER GENERATION SUCCESS MODAL */}
      {/* ======================================================== */}
      {orderSuccessModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-900 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black text-slate-950">Work Order Successfully Generated!</h3>
            <p className="text-xs text-slate-500 mt-1">
              Quotation <span className="font-bold text-slate-800">{orderSuccessModal.quoteNumber}</span> has been confirmed into a legal project contract.
            </p>

            <div className="my-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Work Order No:</span>
                <span className="font-mono font-black text-emerald-700 text-sm">{orderSuccessModal.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Agreed Contract Value:</span>
                <span className="font-extrabold text-amber-700">₹{orderSuccessModal.contractValue.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Link
                href={`/admin/orders?orderId=${orderSuccessModal.orderId}`}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <FileCheck2 className="w-4 h-4" /> View Work Order & Legal Contract ↗
              </Link>
              <Link
                href={`/admin/invoices?orderId=${orderSuccessModal.orderId}&type=PROFORMA`}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <FileText className="w-4 h-4" /> Issue Proforma Invoice (Advance Note)
              </Link>
              <button
                suppressHydrationWarning
                onClick={() => setOrderSuccessModal({ ...orderSuccessModal, open: false })}
                className="w-full py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CREATE NEW QUOTATION MODAL */}
      {/* ======================================================== */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl text-slate-900 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-amber-500" />
                  Generate New Commercial Quotation
                </h2>
                <p className="text-xs text-slate-500">
                  Itemized BOQ calculation with internal cost & profit margin controls.
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

            <form onSubmit={handleCreateQuotation} className="space-y-4">
              {/* Client & Remittance Bank */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Client Profile *
                  </label>
                  <select
                    suppressHydrationWarning
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="">-- Choose from Registered Clients ({clientsList.length}) --</option>
                    {clientsList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.companyName ? `(${c.companyName})` : ""} — {c.phone}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Remittance Bank Account (Letterhead)
                  </label>
                  <select
                    suppressHydrationWarning
                    value={selectedBankId}
                    onChange={(e) => setSelectedBankId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  >
                    {companyBanks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.accountNickname} — {b.bankName} (..{b.accountNumber.slice(-4)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Line Items Editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Work Breakdown & Line Items (with Margin Tracking)
                  </span>
                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={addItemRow}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-semibold transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Work Item
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider border-b border-slate-200 font-bold text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3 w-32">Category</th>
                        <th className="py-2.5 px-3">Description & Scope (Master Selectable)</th>
                        <th className="py-2.5 px-2 w-16">Unit</th>
                        <th className="py-2.5 px-2 w-16">Qty</th>
                        <th className="py-2.5 px-2 w-24 bg-amber-50/50 text-amber-900">Cost Rate (₹)</th>
                        <th className="py-2.5 px-2 w-20 bg-amber-50/50 text-amber-900">Margin %</th>
                        <th className="py-2.5 px-2 w-24">Quoted (₹)</th>
                        <th className="py-2.5 px-3 w-28 text-right">Amount (₹)</th>
                        <th className="py-2.5 px-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 align-top">
                            <input
                              suppressHydrationWarning
                              type="text"
                              value={item.category}
                              onChange={(e) => handleItemChange(idx, "category", e.target.value)}
                              placeholder="Category"
                              className="w-full px-2 py-1.5 bg-white border border-slate-300 text-slate-900 rounded-lg text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                            />
                          </td>
                          <td className="p-2 align-top">
                            <select
                              suppressHydrationWarning
                              defaultValue=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleSelectMasterItem(idx, e.target.value, "CREATE");
                                  e.target.value = "";
                                }
                              }}
                              className="w-full mb-1.5 px-2 py-1 bg-amber-50/80 border border-amber-200 text-amber-900 rounded text-[11px] font-semibold focus:outline-none"
                            >
                              <option value="" disabled>⚡ Preload from Master BOQ / Labor Library...</option>
                              {masterCatalog.map((m) => (
                                <option key={m.id} value={m.id}>
                                  [{m.category}] {m.itemName} — ₹{m.standardRate}/{m.unit}
                                </option>
                              ))}
                            </select>
                            <input
                              suppressHydrationWarning
                              type="text"
                              value={item.description}
                              onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                              placeholder="Detailed item description"
                              className="w-full px-2 py-1.5 bg-white border border-slate-300 text-slate-900 rounded-lg text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                            />
                            <label className="inline-flex items-center gap-1.5 text-[10px] text-slate-600 mt-1 cursor-pointer select-none">
                              <input
                                suppressHydrationWarning
                                type="checkbox"
                                checked={!!item.saveToMaster}
                                onChange={(e) => handleItemChange(idx, "saveToMaster", e.target.checked)}
                                className="rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                              />
                              <span>☑ Save to Master Catalog</span>
                            </label>
                          </td>
                          <td className="p-2 align-top">
                            <select
                              suppressHydrationWarning
                              value={item.unit}
                              onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
                              className="w-full px-1.5 py-1.5 bg-white border border-slate-300 text-slate-900 rounded-lg text-xs"
                            >
                              <option value="sq.ft">sq.ft</option>
                              <option value="cu.ft">cu.ft</option>
                              <option value="nos">nos</option>
                              <option value="r.ft">r.ft</option>
                              <option value="tons">tons</option>
                              <option value="bags">bags</option>
                              <option value="lump_sum">lump_sum</option>
                            </select>
                          </td>
                          <td className="p-2 align-top">
                            <input
                              suppressHydrationWarning
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                              className="w-full px-2 py-1.5 bg-white border border-slate-300 text-slate-900 rounded-lg text-xs text-right"
                            />
                          </td>
                          {/* Cost Rate (Internal) */}
                          <td className="p-2 align-top bg-amber-50/30">
                            <input
                              suppressHydrationWarning
                              type="number"
                              value={item.costRate || ""}
                              onChange={(e) => handleItemChange(idx, "costRate", e.target.value)}
                              placeholder="Cost ₹"
                              className="w-full px-2 py-1.5 bg-white border border-amber-300 text-slate-900 rounded-lg text-xs text-right font-medium"
                              title="Your estimated internal purchase cost per unit"
                            />
                          </td>
                          {/* Margin % (Internal) */}
                          <td className="p-2 align-top bg-amber-50/30">
                            <input
                              suppressHydrationWarning
                              type="number"
                              value={item.marginPercent !== undefined ? item.marginPercent : ""}
                              onChange={(e) => handleItemChange(idx, "marginPercent", e.target.value)}
                              placeholder="20%"
                              className="w-full px-1.5 py-1.5 bg-white border border-amber-300 text-emerald-800 rounded-lg text-xs text-right font-bold"
                              title="Profit margin percentage"
                            />
                          </td>
                          {/* Quoted Unit Rate (Client facing) */}
                          <td className="p-2 align-top">
                            <input
                              suppressHydrationWarning
                              type="number"
                              value={item.unitRate}
                              onChange={(e) => handleItemChange(idx, "unitRate", e.target.value)}
                              className="w-full px-2 py-1.5 bg-white border border-slate-300 text-slate-900 rounded-lg text-xs text-right font-bold"
                            />
                          </td>
                          <td className="p-2 align-top text-right font-extrabold text-amber-700">
                            ₹{item.amount.toLocaleString("en-IN")}
                          </td>
                          <td className="p-2 align-top text-center">
                            <button
                              suppressHydrationWarning
                              type="button"
                              onClick={() => removeItemRow(idx)}
                              className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                              title="Delete row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Calculations & Internal Margin Intelligence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Special Scope Notes / Project Terms
                  </label>
                  <textarea
                    rows={4}
                    value={scopeOfWork}
                    onChange={(e) => setScopeOfWork(e.target.value)}
                    placeholder="e.g. Scope includes foundation, RCC M25, fabrication... Water & power provided by client..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 space-y-2 text-xs">
                  {/* Internal Margin Intelligence Box */}
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                    <div className="flex justify-between font-bold text-[11px]">
                      <span>Internal Contractor Cost:</span>
                      <span>₹{Math.round(totalCost).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between font-black text-xs text-emerald-800">
                      <span>Profit Margin Buffer:</span>
                      <span>+₹{Math.round(totalMargin).toLocaleString("en-IN")} ({overallMarginPercent}%)</span>
                    </div>
                    <p className="text-[10px] text-emerald-700 italic">
                      * Strictly internal. Cost & margin are never printed on client quotation.
                    </p>
                  </div>

                  <div className="flex justify-between text-slate-500">
                    <span>Quoted Subtotal:</span>
                    <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Discount / Negotiation (₹):</span>
                    <input
                      suppressHydrationWarning
                      type="number"
                      value={discountAmount || ""}
                      onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                      className="w-28 px-2 py-1 bg-white border border-slate-200 text-slate-900 rounded text-right text-xs"
                    />
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>GST (18% SAC 9954):</span>
                    <span className="font-semibold text-amber-700">₹{gstAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-900">Final Grand Total:</span>
                    <span className="text-lg font-black text-amber-600">₹{grandTotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  suppressHydrationWarning
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  {creating ? "Generating..." : "Save & Generate Quotation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* QUICK EDIT QUOTATION MODAL (In-place edit) */}
      {/* ======================================================== */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl text-slate-900 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-blue-600" />
                  Quick Edit Quotation: <span className="font-mono text-amber-600">{editingQuoteNumber}</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Direct edit of the current revision values. To log negotiations and create a new revision, use &quot;Revise Quote&quot; instead.
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

            {loadingEditDetails ? (
              <div className="text-center py-16 text-slate-400 text-xs flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                Loading quotation details...
              </div>
            ) : (
              <form onSubmit={handleSaveEditQuotation} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Client *</label>
                    <select
                      suppressHydrationWarning
                      value={editClientId}
                      onChange={(e) => setEditClientId(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:outline-none"
                    >
                      {clientsList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.companyName ? `(${c.companyName})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Remittance Bank</label>
                    <select
                      suppressHydrationWarning
                      value={editBankId}
                      onChange={(e) => setEditBankId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:outline-none"
                    >
                      {companyBanks.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.accountNickname} — {b.bankName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Quote Status</label>
                    <select
                      suppressHydrationWarning
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:outline-none"
                    >
                      <option value="DRAFT">DRAFT</option>
                      <option value="SENT_TO_CLIENT">SENT_TO_CLIENT</option>
                      <option value="REVISED">REVISED</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="DECLINED">DECLINED</option>
                    </select>
                  </div>
                </div>

                {/* Edit Items Table */}
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider border-b border-slate-200 font-bold text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3 w-32">Category</th>
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-2 w-16">Unit</th>
                        <th className="py-2.5 px-2 w-16">Qty</th>
                        <th className="py-2.5 px-2 w-24 bg-amber-50/50 text-amber-900">Cost Rate</th>
                        <th className="py-2.5 px-2 w-20 bg-amber-50/50 text-amber-900">Margin %</th>
                        <th className="py-2.5 px-2 w-24">Quoted (₹)</th>
                        <th className="py-2.5 px-3 w-28 text-right">Amount (₹)</th>
                        <th className="py-2.5 px-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {editItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 align-top">
                            <input
                              suppressHydrationWarning
                              type="text"
                              value={item.category}
                              onChange={(e) => handleEditItemChange(idx, "category", e.target.value)}
                              className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs"
                            />
                          </td>
                          <td className="p-2 align-top">
                            <input
                              suppressHydrationWarning
                              type="text"
                              value={item.description}
                              onChange={(e) => handleEditItemChange(idx, "description", e.target.value)}
                              className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs"
                            />
                          </td>
                          <td className="p-2 align-top">
                            <input
                              suppressHydrationWarning
                              type="text"
                              value={item.unit}
                              onChange={(e) => handleEditItemChange(idx, "unit", e.target.value)}
                              className="w-full px-1.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                            />
                          </td>
                          <td className="p-2 align-top">
                            <input
                              suppressHydrationWarning
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleEditItemChange(idx, "quantity", e.target.value)}
                              className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs text-right"
                            />
                          </td>
                          <td className="p-2 align-top bg-amber-50/30">
                            <input
                              suppressHydrationWarning
                              type="number"
                              value={item.costRate || ""}
                              onChange={(e) => handleEditItemChange(idx, "costRate", e.target.value)}
                              className="w-full px-2 py-1.5 bg-white border border-amber-300 rounded text-xs text-right"
                            />
                          </td>
                          <td className="p-2 align-top bg-amber-50/30">
                            <input
                              suppressHydrationWarning
                              type="number"
                              value={item.marginPercent !== undefined ? item.marginPercent : ""}
                              onChange={(e) => handleEditItemChange(idx, "marginPercent", e.target.value)}
                              className="w-full px-1.5 py-1.5 bg-white border border-amber-300 text-emerald-800 rounded text-xs text-right font-bold"
                            />
                          </td>
                          <td className="p-2 align-top">
                            <input
                              suppressHydrationWarning
                              type="number"
                              value={item.unitRate}
                              onChange={(e) => handleEditItemChange(idx, "unitRate", e.target.value)}
                              className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs text-right font-bold"
                            />
                          </td>
                          <td className="p-2 align-top text-right font-extrabold text-amber-700">
                            ₹{item.amount.toLocaleString("en-IN")}
                          </td>
                          <td className="p-2 align-top text-center">
                            <button
                              suppressHydrationWarning
                              type="button"
                              onClick={() => removeEditItemRow(idx)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
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
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                  >
                    {savingEdit ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* REVISE QUOTATION MODAL (R1 -> R2 -> R3 with Negotiation Log) */}
      {/* ======================================================== */}
      {reviseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl text-slate-900 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200">
                  Creating Revision {nextRevNum}
                </span>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 mt-1">
                  <GitBranch className="w-5 h-5 text-amber-500" />
                  Revise Quotation: <span className="font-mono text-amber-600">{revisingQuoteNumber}</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Freezes previous quote into audit history and creates a formal new revision with negotiation details.
                </p>
              </div>
              <button
                suppressHydrationWarning
                onClick={() => setReviseModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRevision} className="space-y-4">
              {/* Negotiation Notes Box */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
                <label className="block text-xs font-bold text-amber-950 mb-1">
                  Negotiation Notes / Reason for Revision *
                </label>
                <textarea
                  rows={2}
                  required
                  value={negotiationNotes}
                  onChange={(e) => setNegotiationNotes(e.target.value)}
                  placeholder="e.g. Client requested 5% discount on concrete; negotiated ₹390/sq.ft and agreed to 20% advance; reduced boundary wall length..."
                  className="w-full px-3 py-2 bg-white border border-amber-300 text-slate-900 rounded-xl text-xs focus:outline-none"
                />
              </div>

              {/* Revise Items Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider border-b border-slate-200 font-bold text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3 w-32">Category</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-2 w-16">Unit</th>
                      <th className="py-2.5 px-2 w-16">Qty</th>
                      <th className="py-2.5 px-2 w-24 bg-amber-50/50 text-amber-900">Cost Rate</th>
                      <th className="py-2.5 px-2 w-20 bg-amber-50/50 text-amber-900">Margin %</th>
                      <th className="py-2.5 px-2 w-24">Quoted (₹)</th>
                      <th className="py-2.5 px-3 w-28 text-right">Amount (₹)</th>
                      <th className="py-2.5 px-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {reviseItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 align-top">
                          <input
                            suppressHydrationWarning
                            type="text"
                            value={item.category}
                            onChange={(e) => handleReviseItemChange(idx, "category", e.target.value)}
                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs"
                          />
                        </td>
                        <td className="p-2 align-top">
                          <input
                            suppressHydrationWarning
                            type="text"
                            value={item.description}
                            onChange={(e) => handleReviseItemChange(idx, "description", e.target.value)}
                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs"
                          />
                        </td>
                        <td className="p-2 align-top">
                          <input
                            suppressHydrationWarning
                            type="text"
                            value={item.unit}
                            onChange={(e) => handleReviseItemChange(idx, "unit", e.target.value)}
                            className="w-full px-1.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
                          />
                        </td>
                        <td className="p-2 align-top">
                          <input
                            suppressHydrationWarning
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleReviseItemChange(idx, "quantity", e.target.value)}
                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs text-right"
                          />
                        </td>
                        <td className="p-2 align-top bg-amber-50/30">
                          <input
                            suppressHydrationWarning
                            type="number"
                            value={item.costRate || ""}
                            onChange={(e) => handleReviseItemChange(idx, "costRate", e.target.value)}
                            className="w-full px-2 py-1.5 bg-white border border-amber-300 rounded text-xs text-right"
                          />
                        </td>
                        <td className="p-2 align-top bg-amber-50/30">
                          <input
                            suppressHydrationWarning
                            type="number"
                            value={item.marginPercent !== undefined ? item.marginPercent : ""}
                            onChange={(e) => handleReviseItemChange(idx, "marginPercent", e.target.value)}
                            className="w-full px-1.5 py-1.5 bg-white border border-amber-300 text-emerald-800 rounded text-xs text-right font-bold"
                          />
                        </td>
                        <td className="p-2 align-top">
                          <input
                            suppressHydrationWarning
                            type="number"
                            value={item.unitRate}
                            onChange={(e) => handleReviseItemChange(idx, "unitRate", e.target.value)}
                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-xs text-right font-bold"
                          />
                        </td>
                        <td className="p-2 align-top text-right font-extrabold text-amber-700">
                          ₹{item.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="p-2 align-top text-center">
                          <button
                            suppressHydrationWarning
                            type="button"
                            onClick={() => removeReviseItemRow(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={addReviseItemRow}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-amber-400 text-xs font-semibold"
                >
                  + Add Item
                </button>
                <div className="text-right">
                  <span className="text-xs text-slate-500">Revised Grand Total: </span>
                  <span className="text-base font-black text-amber-600">
                    ₹{reviseGrandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => setReviseModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  suppressHydrationWarning
                  type="submit"
                  disabled={savingRevision}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20"
                >
                  {savingRevision ? "Saving Revision..." : `Publish Revision ${nextRevNum}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW & PRINT OFFICIAL LETTERHEAD MODAL */}
      {/* ======================================================== */}
      {viewModalOpen && activeQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl max-h-[95vh] flex flex-col overflow-hidden">
            {/* Action Bar (Not printed) */}
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-amber-400">
                  {activeQuote.quotation.quoteNumber} (Rev {activeQuote.activeRevision.revisionNumber})
                </span>
                <span className="text-slate-400">• Official Commercial Document</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  suppressHydrationWarning
                  onClick={() => shareQuoteWhatsApp(activeQuote)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" /> WhatsApp
                </button>
                <button
                  suppressHydrationWarning
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                </button>
                <button
                  suppressHydrationWarning
                  onClick={() => setViewModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Internal Negotiation Log Banner (Hidden on Print) */}
            {activeQuote.activeRevision.negotiationNotes && (
              <div className="bg-amber-50 px-8 py-2 border-b border-amber-200 text-amber-900 text-xs flex items-center gap-2 print:hidden">
                <GitBranch className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Rev {activeQuote.activeRevision.revisionNumber} Negotiation Log:</strong>{" "}
                  {activeQuote.activeRevision.negotiationNotes}
                </span>
              </div>
            )}

            {/* Printable Letterhead Document */}
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
                        {activeQuote.company?.tradeName || "KANDHAN GROUPS"}
                      </h1>
                      <p className="text-[10px] uppercase tracking-widest text-amber-700 font-extrabold">
                        Civil Construction • Industrial Infrastructure • PMC
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-2 max-w-sm">
                    {activeQuote.company?.address || "Industrial Infrastructure, Tamil Nadu, India"}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Phone: {activeQuote.company?.phone || "+91 94883 44434"} | Email: {activeQuote.company?.email || "kandhangroups@gmail.com"}
                  </p>
                </div>

                <div className="text-right">
                  <div className="inline-block px-3 py-1 rounded bg-amber-100 text-amber-900 font-extrabold text-xs uppercase tracking-wider mb-2">
                    Commercial Quotation
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 font-mono">
                    {activeQuote.quotation.quoteNumber}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-700">
                    Revision: Rev {activeQuote.activeRevision.revisionNumber}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Date: {new Date(activeQuote.activeRevision.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-[11px] font-bold text-slate-800 mt-1">
                    GSTIN: {activeQuote.company?.gstin || "33AAAAA0000A1Z5"}
                  </div>
                </div>
              </div>

              {/* Client & Project Details */}
              <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6">
                <div>
                  <div className="text-[10px] uppercase font-bold text-amber-800 tracking-wider mb-1">
                    Quotation Prepared For:
                  </div>
                  <div className="font-extrabold text-sm text-slate-900">{activeQuote.quotation.clientName}</div>
                  {activeQuote.quotation.companyName && (
                    <div className="font-semibold text-slate-800">{activeQuote.quotation.companyName}</div>
                  )}
                  <div className="text-slate-600">Phone: {activeQuote.quotation.clientPhone}</div>
                  {activeQuote.quotation.gstin && (
                    <div className="text-slate-700 font-semibold">Client GSTIN: {activeQuote.quotation.gstin}</div>
                  )}
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-amber-800 tracking-wider mb-1">
                    Site Location & Scope:
                  </div>
                  <div className="font-semibold text-slate-900">
                    {activeQuote.quotation.siteLocation || "Client Project Site"}
                  </div>
                  <div className="text-slate-600 mt-1">
                    Work Category: {activeQuote.quotation.workType || "Civil Infrastructure"}
                  </div>
                  <div className="text-slate-500 text-[10px] mt-1">
                    Validity: 30 days from date of issue
                  </div>
                </div>
              </div>

              {/* Items Table (CUSTOMER VIEW: SAC 9954 ONLY, COST/MARGIN HIDDEN) */}
              <table className="w-full text-left border-collapse border border-slate-300 mb-6">
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
                  {activeQuote.items.map((it: any, i: number) => (
                    <tr key={it.id}>
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

              {/* Financial Summary */}
              <div className="flex justify-end mb-6">
                <div className="w-72 bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-slate-900">
                      ₹{Number(activeQuote.activeRevision.subtotal).toLocaleString("en-IN")}
                    </span>
                  </div>
                  {activeQuote.activeRevision.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount / Negotiation:</span>
                      <span>-₹{Number(activeQuote.activeRevision.discountAmount).toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>CGST (9%):</span>
                    <span>₹{Number(activeQuote.activeRevision.cgstAmount).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>SGST (9%):</span>
                    <span>₹{Number(activeQuote.activeRevision.sgstAmount).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="pt-2 border-t-2 border-slate-300 flex justify-between font-black text-sm text-slate-950">
                    <span>Grand Total:</span>
                    <span className="text-amber-700">
                      ₹{Number(activeQuote.activeRevision.grandTotal).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions & Bank Remittance */}
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-[11px] text-slate-600">
                <div>
                  <div className="font-bold text-slate-900 uppercase tracking-wider mb-1">
                    Terms & Conditions:
                  </div>
                  <p className="whitespace-pre-line leading-relaxed">
                    {activeQuote.activeRevision.termsAndConditions ||
                      activeQuote.company?.defaultTerms ||
                      "1. Standard payment milestones apply.\n2. Rates valid for 30 days."}
                  </p>
                </div>

                <div>
                  <div className="font-bold text-slate-900 uppercase tracking-wider mb-1">
                    Bank Remittance Details:
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 space-y-1 text-[11px]">
                    <div className="font-bold text-slate-900">
                      Bank: {activeQuote.bankAccount?.bankName || activeQuote.company?.bankName || "State Bank of India"}
                    </div>
                    <div>
                      Account Name: {activeQuote.bankAccount?.accountHolderName || activeQuote.company?.tradeName || "Kandhan Groups"}
                    </div>
                    <div>
                      Account No:{" "}
                      <span className="font-mono font-bold text-slate-900">
                        {activeQuote.bankAccount?.accountNumber || activeQuote.company?.accountNumber || "123456789012"}
                      </span>
                    </div>
                    <div>
                      IFSC Code:{" "}
                      <span className="font-mono font-bold text-slate-900">
                        {activeQuote.bankAccount?.ifscCode || activeQuote.company?.ifscCode || "SBIN0001234"}
                      </span>
                    </div>
                    <div>
                      Branch: {activeQuote.bankAccount?.branch || activeQuote.company?.branch || "Main Branch"}
                    </div>
                    {(activeQuote.bankAccount?.upiId || activeQuote.company?.upiId) && (
                      <div className="text-amber-800 font-semibold">
                        UPI: {activeQuote.bankAccount?.upiId || activeQuote.company?.upiId}
                      </div>
                    )}
                  </div>

                  {/* FIXED: Removed client signature space, prominent Kandhan Groups signature & seal block */}
                  <div className="mt-8 flex justify-end">
                    <div className="text-right">
                      <div className="text-[11px] font-extrabold text-slate-900 tracking-wide uppercase">
                        For KANDHAN GROUPS
                      </div>
                      <div className="w-48 h-16 my-2 border-b-2 border-dashed border-slate-300 ml-auto flex items-end justify-center text-[9px] text-slate-400 italic">
                        (Official Stamp & Signature)
                      </div>
                      <div className="text-[10px] font-bold text-slate-800">Authorized Signatory</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">Date: {new Date().toLocaleDateString("en-IN")}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CONFIRM QUOTE & ISSUE WORK ORDER MODAL */}
      {/* ======================================================== */}
      {confirmModalOpen && quoteToConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <div>
                <div className="text-[10px] uppercase font-bold text-emerald-600">
                  Project Confirmation Milestone
                </div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Confirm Quote & Issue Work Order
                </h2>
              </div>
              <button
                suppressHydrationWarning
                onClick={() => setConfirmModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Confirming <span className="font-bold text-amber-700">{quoteToConfirm.quoteNumber} (Rev {quoteToConfirm.currentRevision})</span> will generate a formal <span className="font-bold text-emerald-700">WORK ORDER</span> and project contract.
            </p>

            <form onSubmit={handleConfirmWorkOrder} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Client:</span>
                  <span className="font-semibold text-slate-900">{quoteToConfirm.clientName}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Final Contract Value:</span>
                  <span className="font-bold text-amber-700">
                    ₹{Number(quoteToConfirm.grandTotal).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Agreed Project Start Date *
                </label>
                <input
                  suppressHydrationWarning
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Completion Date
                </label>
                <input
                  suppressHydrationWarning
                  type="date"
                  value={expectedCompletionDate}
                  onChange={(e) => setExpectedCompletionDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Agreed Advance Amount (₹)
                </label>
                <input
                  suppressHydrationWarning
                  type="number"
                  value={advanceAgreed}
                  onChange={(e) => setAdvanceAgreed(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Client PO Reference (Optional)
                </label>
                <input
                  suppressHydrationWarning
                  type="text"
                  value={clientPoRef}
                  onChange={(e) => setClientPoRef(e.target.value)}
                  placeholder="e.g. PO-2026-09"
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => setConfirmModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  suppressHydrationWarning
                  type="submit"
                  disabled={confirming}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                >
                  {confirming ? "Generating..." : "Confirm & Issue Work Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DELETE QUOTATION MODAL */}
      {/* ======================================================== */}
      {deleteModalOpen && quoteToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-900">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Delete Quotation</h3>
                <p className="text-xs text-slate-500">Permanently removes quote and its revisions.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Are you sure you want to delete <span className="font-bold text-amber-700">{quoteToDelete.quoteNumber}</span> for <span className="font-extrabold text-slate-900">{quoteToDelete.clientName}</span>?
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
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 cursor-pointer disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Delete Quotation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
