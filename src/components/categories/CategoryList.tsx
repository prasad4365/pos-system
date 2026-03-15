"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CategoryForm from "./CategoryForm";
import type { Category } from "@/types";
import { toast } from "sonner";
import { PencilIcon, Trash2Icon, TagIcon } from "lucide-react";

type CategoryWithCount = Category & { _count?: { products: number } };

export default function CategoryList() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<Category | null>(null);

  async function fetchCategories() {
    setLoading(true);
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  async function handleDelete(id: string) {
    const cat = categories.find((c) => c.id === id);
    if (!confirm(`Delete "${cat?.name}"? This cannot be undone.`)) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    setCategories((prev) => prev.filter((c) => c.id !== id));
    toast.error(`"${cat?.name}" deleted.`);
  }

  function handleUpdated(updated: Category) {
    setCategories((prev) =>
      prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
    );
    setEditTarget(null);
  }

  function handleAdded(newCat: Category) {
    setCategories((prev) => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)));
  }

  if (loading)
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border bg-white p-5 space-y-3 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-slate-200 animate-pulse" />
            <div className="h-4 w-3/4 rounded bg-slate-200 animate-pulse" />
            <div className="h-3 w-1/3 rounded bg-slate-100 animate-pulse" />
            <div className="flex gap-2 pt-1">
              <div className="h-8 flex-1 rounded bg-slate-100 animate-pulse" />
              <div className="h-8 flex-1 rounded bg-slate-100 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );

  return (
    <>
      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400 select-none">
          <span className="text-5xl">🗂️</span>
          <p className="font-semibold">No categories yet</p>
          <p className="text-sm">Add your first category above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat, i) => {
            const palette = [
              { bg: "bg-indigo-50", icon: "bg-indigo-100 text-indigo-600", badge: "bg-indigo-100 text-indigo-700" },
              { bg: "bg-violet-50", icon: "bg-violet-100 text-violet-600", badge: "bg-violet-100 text-violet-700" },
              { bg: "bg-emerald-50", icon: "bg-emerald-100 text-emerald-600", badge: "bg-emerald-100 text-emerald-700" },
              { bg: "bg-amber-50", icon: "bg-amber-100 text-amber-600", badge: "bg-amber-100 text-amber-700" },
              { bg: "bg-rose-50", icon: "bg-rose-100 text-rose-600", badge: "bg-rose-100 text-rose-700" },
              { bg: "bg-cyan-50", icon: "bg-cyan-100 text-cyan-600", badge: "bg-cyan-100 text-cyan-700" },
            ];
            const color = palette[i % palette.length];
            const productCount = cat._count?.products ?? 0;
            const canDelete = productCount === 0;

            return (
              <div
                key={cat.id}
                className={`group rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden ${color.bg}`}
              >
                <div className="p-5 flex flex-col gap-3 flex-1">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color.icon}`}>
                    <TagIcon className="w-5 h-5" />
                  </div>

                  {/* Name */}
                  <h3 className="font-extrabold text-slate-800 text-base leading-tight" style={{ fontFamily: "var(--font-jakarta)" }}>
                    {cat.name}
                  </h3>

                  {/* Product count */}
                  <span className={`self-start text-xs font-bold px-2.5 py-1 rounded-full ${color.badge}`}>
                    {productCount} {productCount === 1 ? "product" : "products"}
                  </span>

                  {/* Can't delete note */}
                  {!canDelete && (
                    <p className="text-[10px] text-slate-400">Remove all products to delete</p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="border-t border-black/5 grid grid-cols-2 divide-x divide-black/5 bg-white/60">
                  <button
                    onClick={() => setEditTarget(cat)}
                    className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-white/80 transition-colors"
                  >
                    <PencilIcon className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    disabled={!canDelete}
                    className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-rose-500 hover:bg-rose-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Trash2Icon className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <CategoryForm
              initial={editTarget}
              onSuccess={handleUpdated}
              onCancel={() => setEditTarget(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Hidden form trigger to expose handleAdded for parent page */}
      <span id="__category-list-add" className="hidden" data-handler={String(handleAdded)} />
    </>
  );
}
