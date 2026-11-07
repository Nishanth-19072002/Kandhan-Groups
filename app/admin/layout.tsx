import { ReactNode } from "react";
import { getAuthenticatedUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";

export const metadata = {
  title: "Kandhan Groups — Business Suite",
  description: "ERP, Quotations, Invoicing, Site Purchases & Monthly GST Reconciliation",
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getAuthenticatedUser();

  // If visiting /admin/login, layout renders children directly (no sidebar)
  // Next.js route groups could be used, or check here:
  // Since this layout wraps /admin, for /admin/login we can detect or use shell
  return <AdminShell user={user}>{children}</AdminShell>;
}

