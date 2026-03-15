"use client";

import { useState } from "react";
import CategoryForm from "@/components/categories/CategoryForm";
import CategoryList from "@/components/categories/CategoryList";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Category } from "@/types";

export default function CategoriesPage() {
  const [listKey, setListKey] = useState(0);
  const [open, setOpen] = useState(false);

  function handleAdded(_category: Category) {
    setOpen(false);
    setListKey((k) => k + 1);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1
            className="text-3xl font-extrabold text-slate-800 tracking-tight"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            Categories
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Organise your products into categories.
          </p>
        </div>

        <Button
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold active:scale-[.98] transition-all"
          onClick={() => setOpen(true)}
        >
          + Add Category
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>New Category</DialogTitle>
            </DialogHeader>
            <CategoryForm onSuccess={handleAdded} onCancel={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <CategoryList key={listKey} />
    </div>
  );
}
