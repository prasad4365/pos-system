"use client";

import { useState } from "react";
import ProductForm from "@/components/products/ProductForm";
import ProductTable from "@/components/products/ProductTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Product } from "@/types";

export default function ProductsPage() {
  const [tableKey, setTableKey] = useState(0);
  const [open, setOpen] = useState(false);

  function handleAdded(_product: Product) {
    setOpen(false);
    setTableKey((k) => k + 1);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1
            className="text-3xl font-extrabold text-slate-800 tracking-tight"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            Products
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your product catalogue and stock levels.
          </p>
        </div>

        <Button
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold active:scale-[.98] transition-all"
          onClick={() => setOpen(true)}
        >
          + Add Product
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Product</DialogTitle>
            </DialogHeader>
            <ProductForm onSuccess={handleAdded} onCancel={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <ProductTable key={tableKey} />
    </div>
  );
}
