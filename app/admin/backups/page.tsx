"use client";

import { useEffect, useState } from "react";
import {
  Database,
  Download,
  HardDrive,
  ShieldCheck,
  FileCode,
  CheckCircle2,
  ExternalLink,
  Laptop,
  FolderArchive,
  RefreshCw,
} from "lucide-react";

export default function BackupsPage() {
  const [downloadingDb, setDownloadingDb] = useState(false);
  const [downloadingJson, setDownloadingJson] = useState(false);

  function triggerDbDownload() {
    setDownloadingDb(true);
    window.location.href = "/api/admin/backups/db";
    setTimeout(() => setDownloadingDb(false), 2000);
  }

  function triggerJsonDownload() {
    setDownloadingJson(true);
    window.location.href = "/api/admin/backups/export";
    setTimeout(() => setDownloadingJson(false), 2000);
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Database className="w-6 h-6 text-amber-400" />
          Offline Laptop Backup & Data Ownership Center
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Download your complete database file straight to your laptop hard drive. You have 100% data ownership with zero platform lock-in.
        </p>
      </div>

      {/* Main Download Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Physical .db File Download */}
        <div className="p-6 rounded-2xl bg-white border border-amber-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mb-4 font-bold shadow-xs">
              <Laptop className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">Standalone Database File (.db)</h2>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Download the physical SQLite database file (<code className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-mono text-[11px]">kandhan_groups_backup.db</code>) directly to your laptop&apos;s Downloads folder.
            </p>

            <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Opens Offline on your Laptop</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                You can open and view all your data offline using the free software{" "}
                <a
                  href="https://sqlitebrowser.org/"
                  target="_blank"
                  className="text-amber-700 underline font-semibold hover:text-amber-800"
                >
                  DB Browser for SQLite
                </a>
                .
              </p>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-200">
            <button suppressHydrationWarning
              onClick={triggerDbDownload}
              disabled={downloadingDb}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {downloadingDb ? "Downloading..." : "1-Click Download .db File to Laptop"}
            </button>
          </div>
        </div>

        {/* Card 2: JSON Data Snapshot */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center mb-4 font-bold shadow-xs">
              <FileCode className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">Full Portable JSON Archive (.json)</h2>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Export every single table (Clients, Enquiries, Quotations, Work Orders, Invoices, Payments, Vendors, Purchases, and GST Reconciliations) as a standardized JSON document.
            </p>

            <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Data Portability & Universal Import</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Can be converted to Excel spreadsheets or imported into any ERP or accounting software anytime.
              </p>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-200">
            <button suppressHydrationWarning
              onClick={triggerJsonDownload}
              disabled={downloadingJson}
              className="w-full py-3 px-4 bg-[#0B192C] hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 shadow-md shadow-slate-900/10"
            >
              <Download className="w-4 h-4" />
              {downloadingJson ? "Exporting..." : "Download Full JSON Snapshot"}
            </button>
          </div>
        </div>
      </div>

      {/* Offline Usage Instructions Guide */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-amber-400" />
          How to View Your Database Offline on Your Laptop:
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600 leading-relaxed">
          <li>
            Click the <strong className="text-amber-700">&quot;1-Click Download .db File&quot;</strong> button above. The database will download into your laptop&apos;s <code className="bg-amber-50 px-1.5 py-0.5 rounded text-amber-800 border border-amber-200 font-mono text-[11px]">Downloads</code> folder.
          </li>
          <li>
            Download and install the free, open-source{" "}
            <a
              href="https://sqlitebrowser.org/"
              target="_blank"
              className="text-amber-700 underline font-semibold hover:text-amber-800"
            >
              DB Browser for SQLite
            </a>{" "}
            (Windows installer available for free).
          </li>
          <li>
            Open DB Browser for SQLite on your laptop &rarr; click <strong className="text-slate-900">&quot;Open Database&quot;</strong> &rarr; select the downloaded <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 border border-slate-200 font-mono text-[11px]">.db</code> file.
          </li>
          <li>
            You can view, search, query, and export every quotation, client, and invoice offline anytime, even without internet!
          </li>
        </ol>
      </div>
    </div>
  );
}

