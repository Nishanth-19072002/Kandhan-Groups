"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  HardHat,
  LayoutDashboard,
  Users,
  Contact,
  BookUser,
  FileSpreadsheet,
  FileCheck2,
  Receipt,
  ShoppingCart,
  Calculator,
  Database,
  ShieldCheck,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";

interface AdminShellProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: "SUPER_ADMIN" | "SITE_ENGINEER" | "ACCOUNTANT";
  } | null;
  children: ReactNode;
}

export default function AdminShell({ user, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // If on login page, render children without sidebar shell
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Fallback if not authenticated yet (middleware should handle this, but for SSR safety)
  if (!user) {
    return <>{children}</>;
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  // Role badges & styling
  const roleStyles = {
    SUPER_ADMIN: {
      label: "Super Admin",
      badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      accent: "text-amber-500",
    },
    SITE_ENGINEER: {
      label: "Site Engineer",
      badgeClass: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      accent: "text-blue-400",
    },
    ACCOUNTANT: {
      label: "Accountant",
      badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      accent: "text-emerald-400",
    },
  }[user.role];

  // Navigation Items with RBAC visibility rules
  const navItems = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      visible: true,
    },
    {
      label: "Clients Directory",
      href: "/admin/clients",
      icon: Contact,
      visible: true,
    },
    {
      label: "Trade Network & Rolodex",
      href: "/admin/network",
      icon: BookUser,
      visible: true,
    },
    {
      label: "Enquiries & Leads",
      href: "/admin/enquiries",
      icon: Users,
      visible: true,
    },
    {
      label: "Quotations & Revisions",
      href: "/admin/quotations",
      icon: FileSpreadsheet,
      visible: true,
    },
    {
      label: "Work Orders (Confirmed)",
      href: "/admin/orders",
      icon: FileCheck2,
      visible: true,
    },
    {
      label: "Sales Invoices & Billing",
      href: "/admin/invoices",
      icon: Receipt,
      visible: user.role === "SUPER_ADMIN" || user.role === "ACCOUNTANT",
    },
    {
      label: "Site Purchasing & Bills",
      href: "/admin/purchases",
      icon: ShoppingCart,
      visible: true,
    },
    {
      label: "Monthly GST Engine",
      href: "/admin/gst",
      icon: Calculator,
      visible: user.role === "SUPER_ADMIN" || user.role === "ACCOUNTANT",
    },
    {
      label: "Laptop DB Backup",
      href: "/admin/backups",
      icon: Database,
      visible: user.role === "SUPER_ADMIN",
    },
    {
      label: "Team & Staff",
      href: "/admin/users",
      icon: ShieldCheck,
      visible: user.role === "SUPER_ADMIN",
    },
    {
      label: "Company Settings",
      href: "/admin/settings",
      icon: Settings,
      visible: user.role === "SUPER_ADMIN",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col md:flex-row">
      {/* Mobile Top Header (Navy) */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0B192C] text-white border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Kandhan Groups Logo"
            width={36}
            height={36}
            className="w-9 h-9 rounded-xl object-contain bg-[#070b14] ring-1 ring-amber-400/50 p-0.5 shadow-sm"
          />
          <div>
            <div className="font-bold text-sm text-white">Kandhan Groups</div>
            <div className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase">Business Suite</div>
          </div>
        </div>
        <button
          suppressHydrationWarning
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-35 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation: Deep Corporate Navy (#0B192C / #0f172a) */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-[#0B192C] border-r border-slate-800 flex flex-col z-40 transition-transform duration-200 shadow-xl ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Kandhan Groups Logo"
              width={44}
              height={44}
              className="w-11 h-11 rounded-xl object-contain bg-[#070b14] ring-1 ring-amber-400/50 p-1 shadow-md shadow-amber-500/20"
            />
            <div>
              <div className="font-extrabold text-sm tracking-wide text-white">Kandhan Groups</div>
              <div className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">
                ERP & Business Suite
              </div>
            </div>
          </Link>
        </div>

        {/* User Card */}
        <div className="p-3.5 mx-3 my-3 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-white truncate">{user.name}</span>
            <span
              className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full border ${roleStyles.badgeClass}`}
            >
              {roleStyles.label}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate font-medium">{user.email}</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems
            .filter((item) => item.visible)
            .map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold shadow-md shadow-amber-500/25"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <a
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-slate-300 hover:text-amber-400 hover:bg-slate-800/60 transition"
          >
            <span className="flex items-center gap-2 font-medium">
              <ExternalLink className="w-3.5 h-3.5" />
              Public Website
            </span>
            <span className="text-[10px] text-amber-400 font-bold">Live</span>
          </a>

          <button
            suppressHydrationWarning
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>{loggingOut ? "Signing out..." : "Sign Out"}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area (Crisp White Canvas) */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden bg-[#f8fafc]">
        {/* Top Header (Clean White + Navy text + Gold badge) */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200/90 shadow-xs sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-slate-600 font-bold">
              Kandhan Groups Digital Management
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {roleStyles.label} Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs font-extrabold text-slate-900">{user.name}</div>
              <div className="text-[10px] text-slate-500 font-medium">{user.email}</div>
            </div>
            <button
              suppressHydrationWarning
              onClick={handleLogout}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-rose-600 transition text-xs flex items-center gap-1.5 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">{children}</div>
      </main>
    </div>
  );
}
