import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// 1. Users & RBAC
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  phone: text("phone"),
  role: text("role", { enum: ["SUPER_ADMIN", "SITE_ENGINEER", "ACCOUNTANT"] }).notNull(),
  isActive: integer("is_active").notNull().default(1),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// 2. Clients
export const clients = sqliteTable("clients", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  companyName: text("company_name"),
  gstin: text("gstin"),
  billingAddress: text("billing_address"),
  siteAddress: text("site_address"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// 3. Enquiries
export const enquiries = sqliteTable("enquiries", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  assignedToUserId: text("assigned_to_user_id").references(() => users.id),
  workType: text("work_type").notNull(),
  siteLocation: text("site_location").notNull(),
  description: text("description"),
  estimatedBudget: real("estimated_budget"),
  status: text("status", {
    enum: ["NEW", "CONTACTED", "SITE_VISIT_SCHEDULED", "SITE_VISITED", "QUOTATION_SENT", "CONFIRMED", "LOST"],
  }).notNull().default("NEW"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// 4. Followups
export const followups = sqliteTable("followups", {
  id: text("id").primaryKey(),
  enquiryId: text("enquiry_id").notNull().references(() => enquiries.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id),
  channel: text("channel", {
    enum: ["PHONE_CALL", "WHATSAPP", "SITE_MEETING", "OFFICE_VISIT"],
  }).notNull().default("PHONE_CALL"),
  notes: text("notes").notNull(),
  followupDate: text("followup_date").notNull(),
  nextReminderDate: text("next_reminder_date"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// 5. Quotations
export const quotations = sqliteTable("quotations", {
  id: text("id").primaryKey(),
  enquiryId: text("enquiry_id").references(() => enquiries.id),
  clientId: text("client_id").notNull().references(() => clients.id),
  quoteNumber: text("quote_number").notNull().unique(), // e.g. KG-Q-2026-001
  currentRevision: integer("current_revision").notNull().default(1),
  status: text("status", {
    enum: ["DRAFT", "PENDING_APPROVAL", "SENT_TO_CLIENT", "REVISED", "CONFIRMED", "DECLINED"],
  }).notNull().default("DRAFT"),
  createdByUserId: text("created_by_user_id").references(() => users.id),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// 6. Quotation Revisions
export const quotationRevisions = sqliteTable("quotation_revisions", {
  id: text("id").primaryKey(),
  quotationId: text("quotation_id").notNull().references(() => quotations.id, { onDelete: "cascade" }),
  revisionNumber: integer("revision_number").notNull(),
  subtotal: real("subtotal").notNull().default(0),
  gstRate: real("gst_rate").notNull().default(18.0),
  cgstAmount: real("cgst_amount").notNull().default(0),
  sgstAmount: real("sgst_amount").notNull().default(0),
  igstAmount: real("igst_amount").notNull().default(0),
  discountAmount: real("discount_amount").notNull().default(0),
  grandTotal: real("grand_total").notNull().default(0),
  totalCost: real("total_cost").default(0),
  totalMargin: real("total_margin").default(0),
  overallMarginPercent: real("overall_margin_percent").default(0),
  negotiationNotes: text("negotiation_notes"),
  scopeOfWork: text("scope_of_work"),
  termsAndConditions: text("terms_and_conditions"),
  bankAccountId: text("bank_account_id"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// 7. Quotation Items
export const quotationItems = sqliteTable("quotation_items", {
  id: text("id").primaryKey(),
  revisionId: text("revision_id").notNull().references(() => quotationRevisions.id, { onDelete: "cascade" }),
  itemOrder: integer("item_order").notNull().default(0),
  category: text("category").notNull(),
  description: text("description").notNull(),
  hsnSacCode: text("hsn_sac_code").default("9954"),
  unit: text("unit").notNull(), // sq.ft, r.ft, cu.ft, nos, bags, tons, lump_sum
  quantity: real("quantity").notNull(),
  costRate: real("cost_rate").default(0), // Internal Base Cost (Hidden on Letterhead/PDF)
  marginPercent: real("margin_percent").default(0), // Profit Margin % (Hidden on Letterhead/PDF)
  unitRate: real("unit_rate").notNull(), // Client Quoted Rate
  amount: real("amount").notNull(),
});

// 8. Order Confirmations / Work Orders
export const orderConfirmations = sqliteTable("order_confirmations", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(), // e.g. KG-WO-2026-001
  enquiryId: text("enquiry_id").references(() => enquiries.id),
  quotationId: text("quotation_id").notNull().references(() => quotations.id),
  confirmedRevisionId: text("confirmed_revision_id").notNull().references(() => quotationRevisions.id),
  clientId: text("client_id").notNull().references(() => clients.id),
  clientPoReference: text("client_po_reference"),
  signedContractUrl: text("signed_contract_url"),
  contractTerms: text("contract_terms"),
  bankAccountId: text("bank_account_id"),
  agreedContractValue: real("agreed_contract_value").notNull(),
  advanceAgreed: real("advance_agreed").notNull(),
  startDate: text("start_date").notNull(),
  expectedCompletionDate: text("expected_completion_date"),
  assignedEngineerId: text("assigned_engineer_id").references(() => users.id),
  status: text("status", {
    enum: ["ACTIVE", "IN_PROGRESS", "COMPLETED", "ON_HOLD"],
  }).notNull().default("ACTIVE"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// 9. Proforma Invoices
export const proformaInvoices = sqliteTable("proforma_invoices", {
  id: text("id").primaryKey(),
  quotationId: text("quotation_id").notNull().references(() => quotations.id),
  clientId: text("client_id").notNull().references(() => clients.id),
  piNumber: text("pi_number").notNull().unique(), // KG-PI-2026-001
  totalAmount: real("total_amount").notNull(),
  advanceRequested: real("advance_requested").notNull(),
  status: text("status", {
    enum: ["ISSUED", "ACCEPTED", "CONVERTED_TO_INVOICE", "CANCELLED"],
  }).notNull().default("ISSUED"),
  issuedDate: text("issued_date").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// 10. Sales Invoices (Output GST)
export const salesInvoices = sqliteTable("sales_invoices", {
  id: text("id").primaryKey(),
  orderConfirmationId: text("order_confirmation_id").references(() => orderConfirmations.id),
  quotationId: text("quotation_id").references(() => quotations.id),
  clientId: text("client_id").notNull().references(() => clients.id),
  invoiceNumber: text("invoice_number").notNull().unique(), // KG-INV-2026-001
  invoiceType: text("invoice_type", {
    enum: ["TAX_INVOICE", "PROFORMA", "BILL_OF_SUPPLY", "REVISED_INVOICE"],
  }).notNull().default("TAX_INVOICE"),
  invoiceDate: text("invoice_date").notNull(),
  dueDate: text("due_date"),
  taxableValue: real("taxable_value").notNull(),
  gstRate: real("gst_rate").notNull().default(18.0),
  cgstAmount: real("cgst_amount").notNull().default(0),
  sgstAmount: real("sgst_amount").notNull().default(0),
  igstAmount: real("igst_amount").notNull().default(0),
  totalInvoiceAmount: real("total_invoice_amount").notNull(),
  amountPaid: real("amount_paid").notNull().default(0),
  balanceAmount: real("balance_amount").notNull(),
  paymentStatus: text("payment_status", {
    enum: ["UNPAID", "PARTIAL", "PAID"],
  }).notNull().default("UNPAID"),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// 11. Invoice Payments
export const invoicePayments = sqliteTable("invoice_payments", {
  id: text("id").primaryKey(),
  invoiceId: text("invoice_id").notNull().references(() => salesInvoices.id, { onDelete: "cascade" }),
  paymentDate: text("payment_date").notNull(),
  amount: real("amount").notNull(),
  paymentMode: text("payment_mode", {
    enum: ["NEFT_RTGS", "UPI", "CHEQUE", "CASH"],
  }).notNull(),
  referenceNumber: text("reference_number"),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// 12. Vendors
export const vendors = sqliteTable("vendors", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  phone: text("phone").notNull(),
  email: text("email"),
  gstin: text("gstin"),
  category: text("category").notNull(), // Cement, Steel, Sand, Electrical, Plumbing, Labor, Machinery
  bankDetails: text("bank_details"),
  address: text("address"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// 13. Purchase Orders
export const purchaseOrders = sqliteTable("purchase_orders", {
  id: text("id").primaryKey(),
  vendorId: text("vendor_id").notNull().references(() => vendors.id),
  orderConfirmationId: text("order_confirmation_id").references(() => orderConfirmations.id),
  poNumber: text("po_number").notNull().unique(), // KG-PO-2026-001
  poDate: text("po_date").notNull(),
  deliverySite: text("delivery_site").notNull(),
  totalAmount: real("total_amount").notNull(),
  status: text("status", {
    enum: ["DRAFT", "ISSUED_TO_VENDOR", "COMPLETED", "CANCELLED"],
  }).notNull().default("DRAFT"),
  createdByUserId: text("created_by_user_id").references(() => users.id),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// 14. Purchase Bills (Inward Supplies / Input Tax Credit)
export const purchaseBills = sqliteTable("purchase_bills", {
  id: text("id").primaryKey(),
  vendorId: text("vendor_id").notNull().references(() => vendors.id),
  purchaseOrderId: text("purchase_order_id").references(() => purchaseOrders.id),
  orderConfirmationId: text("order_confirmation_id").references(() => orderConfirmations.id),
  vendorInvoiceNumber: text("vendor_invoice_number").notNull(),
  billDate: text("bill_date").notNull(),
  category: text("category").notNull(),
  taxableValue: real("taxable_value").notNull(),
  cgstAmount: real("cgst_amount").notNull().default(0),
  sgstAmount: real("sgst_amount").notNull().default(0),
  igstAmount: real("igst_amount").notNull().default(0),
  totalBillAmount: real("total_bill_amount").notNull(),
  itcEligibility: text("itc_eligibility", {
    enum: ["ELIGIBLE", "INELIGIBLE", "BLOCKED"],
  }).notNull().default("ELIGIBLE"),
  paymentStatus: text("payment_status", {
    enum: ["UNPAID", "PARTIAL", "PAID"],
  }).notNull().default("UNPAID"),
  verifiedByAccountant: integer("verified_by_accountant").notNull().default(0),
  createdByUserId: text("created_by_user_id").references(() => users.id),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// 15. Bill Attachments (Photo/PDF Uploads)
export const billAttachments = sqliteTable("bill_attachments", {
  id: text("id").primaryKey(),
  purchaseBillId: text("purchase_bill_id").notNull().references(() => purchaseBills.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(), // Cloudflare R2 / local URL
  fileSizeBytes: integer("file_size_bytes"),
  mimeType: text("mime_type"),
  uploadedAt: text("uploaded_at").default(sql`CURRENT_TIMESTAMP`),
});

// 16. Monthly GST Reconciliations
export const gstMonthlyReconciliations = sqliteTable("gst_monthly_reconciliations", {
  id: text("id").primaryKey(),
  filingMonth: integer("filing_month").notNull(), // 1 to 12
  filingYear: integer("filing_year").notNull(),
  returnType: text("return_type", {
    enum: ["GSTR_1", "GSTR_3B", "NIL_RETURN"],
  }).notNull(),
  totalOutwardTaxable: real("total_outward_taxable").notNull().default(0),
  outputCgst: real("output_cgst").notNull().default(0),
  outputSgst: real("output_sgst").notNull().default(0),
  outputIgst: real("output_igst").notNull().default(0),
  totalInwardTaxable: real("total_inward_taxable").notNull().default(0),
  inputEligibleCgst: real("input_eligible_cgst").notNull().default(0),
  inputEligibleSgst: real("input_eligible_sgst").notNull().default(0),
  inputEligibleIgst: real("input_eligible_igst").notNull().default(0),
  manualAdjustmentCgst: real("manual_adjustment_cgst").notNull().default(0),
  manualAdjustmentSgst: real("manual_adjustment_sgst").notNull().default(0),
  manualAdjustmentIgst: real("manual_adjustment_igst").notNull().default(0),
  adjustmentReason: text("adjustment_reason"),
  netPayableCgst: real("net_payable_cgst").notNull().default(0),
  netPayableSgst: real("net_payable_sgst").notNull().default(0),
  netPayableIgst: real("net_payable_igst").notNull().default(0),
  status: text("status", {
    enum: ["DRAFT", "READY_FOR_AUDITOR", "FILED"],
  }).notNull().default("DRAFT"),
  filedOn: text("filed_on"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// 17. Company Settings & Profile
export const companySettings = sqliteTable("company_settings", {
  id: text("id").primaryKey().default("primary"),
  companyName: text("company_name").notNull().default("Kandhan Groups"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  gstin: text("gstin"),
  pan: text("pan"),
  bankName: text("bank_name"),
  accountNumber: text("account_number"),
  ifscCode: text("ifsc_code"),
  branch: text("branch"),
  defaultTerms: text("default_terms"),
});

// 18. Company Bank Accounts (Multi-Bank Registry)
export const companyBankAccounts = sqliteTable("company_bank_accounts", {
  id: text("id").primaryKey(),
  accountNickname: text("account_nickname").notNull(),
  bankName: text("bank_name").notNull(),
  accountHolderName: text("account_holder_name").notNull().default("Kandhan Groups"),
  accountNumber: text("account_number").notNull(),
  ifscCode: text("ifsc_code").notNull(),
  branch: text("branch"),
  upiId: text("upi_id"),
  isDefault: integer("is_default", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// 19. Master BOQ Rate & Labor Items Library
export const masterItems = sqliteTable("master_items", {
  id: text("id").primaryKey(),
  category: text("category").notNull(),
  itemName: text("item_name").notNull(),
  description: text("description").notNull(),
  unit: text("unit").notNull(),
  standardRate: real("standard_rate").notNull().default(0),
  hsnSacCode: text("hsn_sac_code").default("9954"),
  isCustom: integer("is_custom", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// 20. Audit Trail
export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  details: text("details"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// 21. Business Network Groups (Group-wise Trade Directory)
export const networkGroups = sqliteTable("network_groups", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// 22. Business Network Contacts
export const networkContacts = sqliteTable("network_contacts", {
  id: text("id").primaryKey(),
  groupId: text("group_id")
    .notNull()
    .references(() => networkGroups.id, { onDelete: "cascade" }),
  firmName: text("firm_name"),
  contactPerson: text("contact_person").notNull(),
  phone: text("phone").notNull(),
  alternatePhone: text("alternate_phone"),
  email: text("email"),
  city: text("city").notNull(),
  areaLocality: text("area_locality"),
  fullAddress: text("full_address"),
  standardRate: text("standard_rate"),
  rateUnit: text("rate_unit"),
  paymentTerms: text("payment_terms"),
  description: text("description"),
  rating: integer("rating").default(5),
  tierLevel: text("tier_level").default("TIER_1"),
  gstin: text("gstin"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

