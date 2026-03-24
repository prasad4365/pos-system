"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { PlusIcon, PencilIcon, Trash2Icon } from "lucide-react";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CASHIER";
  createdAt: string;
}

const emptyForm = { name: "", email: "", password: "", role: "CASHIER" as "ADMIN" | "CASHIER" };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<UserRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) setUsers(await res.json());
    } finally {
      setLoading(false);
    }
  }

  //Test Comment 

  useEffect(() => { loadUsers(); }, []);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm });
    setFormError(null);
    setDialogOpen(true);
  }

  function openEdit(u: UserRecord) {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: "", role: u.role });
    setFormError(null);
    setDialogOpen(true);
  }

  async function handleSave() {
    setFormError(null);
    if (!form.name.trim() || !form.email.trim()) {
      setFormError("Name and email are required.");
      return;
    }
    if (!editing && !form.password.trim()) {
      setFormError("Password is required for new users.");
      return;
    }

    setSaving(true);
    try {
      const url = editing ? `/api/admin/users/${editing.id}` : "/api/admin/users";
      const method = editing ? "PUT" : "POST";
      const body: Record<string, string> = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
      };
      if (form.password.trim()) body.password = form.password.trim();

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error ?? "Save failed."); return; }

      toast.success(editing ? "User updated." : "User created.");
      setDialogOpen(false);
      loadUsers();
    } catch {
      setFormError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Delete failed."); return; }
      toast.success(`${deleteTarget.name} removed.`);
      setDeleteTarget(null);
      loadUsers();
    } catch {
      toast.error("Network error.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h1
            className="text-3xl font-extrabold text-slate-800 tracking-tight"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Register and manage cashier accounts
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          Add User
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b text-muted-foreground text-xs uppercase tracking-wider">
              <th className="text-left px-5 py-3 font-semibold">Name</th>
              <th className="text-left px-5 py-3 font-semibold">Email</th>
              <th className="text-left px-5 py-3 font-semibold">Role</th>
              <th className="text-left px-5 py-3 font-semibold">Created</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b last:border-0">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-3 rounded bg-slate-100 animate-pulse w-24" />
                    </td>
                  ))}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-14 text-muted-foreground">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-800">{u.name}</td>
                  <td className="px-5 py-3.5 text-slate-600">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        u.role === "ADMIN"
                          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                          : "bg-indigo-50 text-indigo-700 border-indigo-200"
                      }`}
                    >
                      {u.role === "ADMIN" ? "🛡️" : "💼"} {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">
                    {new Date(u.createdAt).toLocaleDateString("en-US", {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 gap-1.5 text-xs"
                        onClick={() => openEdit(u)}
                      >
                        <PencilIcon className="w-3 h-3" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 gap-1.5 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
                        onClick={() => setDeleteTarget(u)}
                      >
                        <Trash2Icon className="w-3 h-3" /> Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit User" : "Add New User"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="u-name">Full Name</Label>
              <Input
                id="u-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Jane Smith"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="u-email">Email</Label>
              <Input
                id="u-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="jane@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="u-password">
                Password {editing && <span className="text-muted-foreground text-xs">(leave blank to keep current)</span>}
              </Label>
              <Input
                id="u-password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder={editing ? "••••••••" : "Minimum 6 characters"}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm((f) => ({ ...f, role: v as "ADMIN" | "CASHIER" }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASHIER">💼 Cashier</SelectItem>
                  <SelectItem value="ADMIN">🛡️ Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">
                {formError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white"
              >
                {saving ? "Saving…" : editing ? "Save Changes" : "Create User"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 mt-1">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-slate-800">{deleteTarget?.name}</span>? This cannot
            be undone.
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
