"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Plus,
  Search,
  UserCheck,
  UserX,
  Trash2,
  KeyRound,
  Mail,
  Phone,
  HardHat,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

interface UserItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "SUPER_ADMIN" | "SITE_ENGINEER" | "ACCOUNTANT";
  isActive: number;
  createdAt: string;
}

export default function UsersManagementPage() {
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Create User Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "SITE_ENGINEER",
  });

  // Reset Password Modal
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState<UserItem | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);

  // Delete User Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok && data.users) {
        setUsersList(data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      setCreateModalOpen(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "SITE_ENGINEER",
      });
      fetchUsers();
    } catch (err: any) {
      setCreateError(err.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  }

  async function handleRoleChange(userId: string, newRole: string) {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsersList((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole as any } : u))
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleToggleActive(user: UserItem) {
    const updated = user.isActive === 1 ? 0 : 1;
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: updated }),
      });
      if (res.ok) {
        setUsersList((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isActive: updated } : u))
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  function openDeleteModal(user: UserItem) {
    setUserToDelete(user);
    setDeleteError("");
    setDeleteModalOpen(true);
  }

  async function handleConfirmDelete() {
    if (!userToDelete) return;
    setDeleting(true);
    setDeleteError("");

    try {
      const res = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setDeleteModalOpen(false);
        setUserToDelete(null);
        fetchUsers();
      } else {
        setDeleteError(data.error || "Failed to delete user account");
      }
    } catch (err) {
      console.error(err);
      setDeleteError("Network error while deleting user");
    } finally {
      setDeleting(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!targetUser || !newPassword) return;
    setResetting(true);

    try {
      const res = await fetch(`/api/admin/users/${targetUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      if (res.ok) {
        setResetModalOpen(false);
        setTargetUser(null);
        setNewPassword("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  }

  const roleStyles = {
    SUPER_ADMIN: {
      label: "Super Admin",
      badge: "bg-amber-50 text-amber-800 border-amber-200",
    },
    SITE_ENGINEER: {
      label: "Site Engineer",
      badge: "bg-blue-50 text-blue-800 border-blue-200",
    },
    ACCOUNTANT: {
      label: "Accountant",
      badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
    },
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search));

    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            Team Staff & Role Access Control (RBAC)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Table view of employee accounts, permissions, password resets, and staff account management.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            suppressHydrationWarning
            onClick={() => fetchUsers()}
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 shadow-xs transition cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            suppressHydrationWarning
            onClick={() => {
              setCreateError("");
              setCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Team Member
          </button>
        </div>
      </div>

      {/* Role Access Guide Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-white border border-amber-200/90 shadow-xs text-xs space-y-1">
          <div className="font-extrabold text-amber-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Super Admin (Owner)
          </div>
          <p className="text-[11px] text-slate-600">
            Full master control, client quotes, sales invoices, company financials, GST & offline laptop DB backups.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-blue-200/90 shadow-xs text-xs space-y-1">
          <div className="font-extrabold text-blue-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Site Engineer
          </div>
          <p className="text-[11px] text-slate-600">
            Assigned project execution, mobile camera bill uploads, and site measurement logging.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-emerald-200/90 shadow-xs text-xs space-y-1">
          <div className="font-extrabold text-emerald-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Accountant
          </div>
          <p className="text-[11px] text-slate-600">
            Client payment entries, vendor ITC bill verification, GST reports, and 1-click CA export.
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            suppressHydrationWarning
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by staff name, email, phone..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { val: "ALL", label: "All Roles" },
            { val: "SUPER_ADMIN", label: "Super Admins" },
            { val: "SITE_ENGINEER", label: "Engineers" },
            { val: "ACCOUNTANT", label: "Accountants" },
          ].map((opt) => (
            <button
              suppressHydrationWarning
              key={opt.val}
              onClick={() => setRoleFilter(opt.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                roleFilter === opt.val
                  ? "bg-amber-500 text-slate-950"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
          Loading team accounts...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200/90 p-8 shadow-xs">
          <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <div className="text-sm font-bold text-slate-800">No users found</div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-600 uppercase tracking-wider border-b border-slate-200 font-bold text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Staff Member</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4 w-44">Assigned Role</th>
                  <th className="py-3.5 px-3 w-32 text-center">Status</th>
                  <th className="py-3.5 px-3 w-32">Created Date</th>
                  <th className="py-3.5 px-4 w-36 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const style = roleStyles[u.role] || roleStyles.SITE_ENGINEER;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition group">
                      {/* Staff Member */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 text-sm">{u.name}</div>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border mt-1 inline-block ${style.badge}`}
                        >
                          {style.label}
                        </span>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-300 flex items-center gap-1.5 font-medium">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span>{u.email}</span>
                        </div>
                        {u.phone && (
                          <div className="text-slate-500 text-[11px] flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-3.5 h-3.5 text-slate-600" />
                            <span>{u.phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Role Selector */}
                      <td className="py-3.5 px-4">
                        <select
                          suppressHydrationWarning
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-semibold cursor-pointer focus:outline-none focus:border-amber-400"
                        >
                          <option value="SUPER_ADMIN">Super Admin</option>
                          <option value="SITE_ENGINEER">Site Engineer</option>
                          <option value="ACCOUNTANT">Accountant</option>
                        </select>
                      </td>

                      {/* Access Status Toggle */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          suppressHydrationWarning
                          onClick={() => handleToggleActive(u)}
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border cursor-pointer transition ${
                            u.isActive === 1
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-rose-50 text-rose-800 border-rose-200"
                          }`}
                        >
                          {u.isActive === 1 ? "Active" : "Disabled"}
                        </button>
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                      </td>

                      {/* Actions: Reset Password, Delete */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Reset Password */}
                          <button
                            suppressHydrationWarning
                            onClick={() => {
                              setTargetUser(u);
                              setNewPassword("");
                              setResetModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                            title="Reset Staff Password"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                          </button>

                          {/* Delete Account */}
                          <button
                            suppressHydrationWarning
                            onClick={() => openDeleteModal(u)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition cursor-pointer"
                            title="Delete User Account"
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
      {/* DELETE USER MODAL */}
      {/* ======================================================== */}
      {deleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Delete User Account</h3>
                <p className="text-xs text-slate-400">Permanently revokes all system access.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Are you sure you want to delete staff account for{" "}
              <span className="font-extrabold text-slate-900">{userToDelete.name}</span> ({userToDelete.email})?
            </p>

            {deleteError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {deleteError}
              </div>
            )}

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
                {deleting ? "Deleting..." : "Yes, Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* RESET PASSWORD MODAL */}
      {/* ======================================================== */}
      {resetModalOpen && targetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                Reset Staff Password
              </h2>
              <button
                suppressHydrationWarning
                onClick={() => setResetModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Enter a new secure password for <span className="text-slate-900 font-bold">{targetUser.name}</span> ({targetUser.email}).
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 font-semibold mb-1">
                  New Password *
                </label>
                <input
                  suppressHydrationWarning
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  suppressHydrationWarning
                  type="submit"
                  disabled={resetting}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  {resetting ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CREATE USER MODAL */}
      {/* ======================================================== */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                Add New Staff Member
              </h2>
              <button
                suppressHydrationWarning
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 font-semibold mb-1">
                  Full Name *
                </label>
                <input
                  suppressHydrationWarning
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Anand Kumar"
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 font-semibold mb-1">
                  Login Email *
                </label>
                <input
                  suppressHydrationWarning
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. anand@kandhangroups.com"
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 font-semibold mb-1">
                  Initial Password *
                </label>
                <input
                  suppressHydrationWarning
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min. 6 characters"
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 font-semibold mb-1">
                  Phone Number
                </label>
                <input
                  suppressHydrationWarning
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +91 94883 44434"
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 font-semibold mb-1">
                  Assign Operational Role *
                </label>
                <select
                  suppressHydrationWarning
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-xl text-xs focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none focus:border-amber-400 font-semibold"
                >
                  <option value="SITE_ENGINEER">Site Engineer (Field uploads & site logging)</option>
                  <option value="ACCOUNTANT">Accountant (Invoices, billing, ITC verification)</option>
                  <option value="SUPER_ADMIN">Super Admin (Full master suite access)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
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
                  {creating ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
