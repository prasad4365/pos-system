"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProductForm from "./ProductForm";
import type { Product } from "@/types";
import { toast } from "sonner";
import { PencilIcon, Trash2Icon, PackagePlusIcon, SearchIcon, XIcon } from "lucide-react";
import CategoryFilter from "@/components/pos/CategoryFilter";

type StockFilter = "all" | "in-stock" | "low-stock" | "out-of-stock";

export default function ProductTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [restockTarget, setRestockTarget] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState("");
  const [restockLoading, setRestockLoading] = useState(false);

  async function fetchProducts() {
    setLoading(true);
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function handleDelete(id: string) {
    const product = products.find((p) => p.id === id);
    if (!confirm(`Delete "${product?.name}"? This cannot be undone.`)) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.error(`"${product?.name}" deleted.`);
  }

  function handleUpdated(updated: Product) {
    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
    setEditTarget(null);
  }

  async function handleRestock() {
    if (!restockTarget || !restockQty) return;
    setRestockLoading(true);
    const res = await fetch(
      `/api/products/${restockTarget.id}?action=restock`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: Number(restockQty) }),
      }
    );
    if (res.ok) {
      const updated = await res.json();
      setProducts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      toast.success(`✅ Restocked "${restockTarget.name}" +${restockQty} units`, {
        description: `New stock: ${updated.stock}`,
      });
      setRestockTarget(null);
      setRestockQty("");
    }
    setRestockLoading(false);
  }

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode ?? "").includes(search);
    const matchCategory =
      !selectedCategoryIds.length || selectedCategoryIds.includes(p.category?.id ?? "");
    const matchStock =
      stockFilter === "all" ||
      (stockFilter === "out-of-stock" && p.stock === 0) ||
      (stockFilter === "low-stock" && p.stock > 0 && p.stock < 10) ||
      (stockFilter === "in-stock" && p.stock >= 10);
    return matchSearch && matchCategory && matchStock;
  });

  const activeFilterCount =
    selectedCategoryIds.length + (stockFilter !== "all" ? 1 : 0);

  function clearFilters() {
    setSelectedCategoryIds([]);
    setStockFilter("all");
    setSearch("");
  }

  function stockBadge(stock: number) {
    if (stock === 0)
      return <Badge variant="destructive" className="text-xs">Out of Stock</Badge>;
    if (stock < 10)
      return <Badge className="border-amber-400 text-amber-700 bg-amber-50 hover:bg-amber-50 text-xs">{stock} Low</Badge>;
    return <Badge className="border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-50 text-xs">{stock} In Stock</Badge>;
  }

  if (loading)
    return (
      <div className="space-y-4">
        <div className="h-10 w-72 rounded-lg bg-slate-200 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border bg-white p-4 space-y-3 shadow-sm">
              <div className="h-4 w-3/4 rounded bg-slate-200 animate-pulse" />
              <div className="h-3 w-1/2 rounded bg-slate-100 animate-pulse" />
              <div className="h-3 w-1/3 rounded bg-slate-100 animate-pulse" />
              <div className="flex gap-2 pt-2">
                <div className="h-8 flex-1 rounded bg-slate-100 animate-pulse" />
                <div className="h-8 flex-1 rounded bg-slate-100 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );

  return (
    <>
      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-2 mb-5 w-full items-center">
        {/* Search */}
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name, SKU or barcode…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 border-slate-200 focus:border-indigo-400 bg-white shadow-sm w-full"
          />
        </div>

        {/* Category filter */}
        <CategoryFilter
          selectedIds={selectedCategoryIds}
          onChange={setSelectedCategoryIds}
        />

        {/* Stock status chips */}
        <div className="flex gap-1.5 flex-wrap">
          {(["all", "in-stock", "low-stock", "out-of-stock"] as StockFilter[]).map((s) => {
            const labels: Record<StockFilter, string> = {
              all: "All Stock",
              "in-stock": "In Stock",
              "low-stock": "Low Stock",
              "out-of-stock": "Out of Stock",
            };
            const colours: Record<StockFilter, string> = {
              all: "bg-slate-100 text-slate-600 hover:bg-slate-200",
              "in-stock": "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
              "low-stock": "bg-amber-50 text-amber-700 hover:bg-amber-100",
              "out-of-stock": "bg-rose-50 text-rose-600 hover:bg-rose-100",
            };
            const active: Record<StockFilter, string> = {
              all: "bg-slate-700 text-white",
              "in-stock": "bg-emerald-500 text-white",
              "low-stock": "bg-amber-500 text-white",
              "out-of-stock": "bg-rose-500 text-white",
            };
            const isActive = stockFilter === s;
            return (
              <button
                key={s}
                onClick={() => setStockFilter(s)}
                className={`h-10 px-3 rounded-lg text-xs font-semibold transition-colors ${
                  isActive ? active[s] : colours[s]
                }`}
              >
                {labels[s]}
              </button>
            );
          })}
        </div>

        {/* Clear filters */}
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="h-10 px-3 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 flex items-center gap-1 transition-colors"
          >
            <XIcon className="w-3.5 h-3.5" />
            Clear ({activeFilterCount})
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400 select-none">
          <span className="text-5xl">📦</span>
          <p className="font-semibold">No products found</p>
          <p className="text-sm">Try a different search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" aria-label="Products grid">
          {filtered.map((product) => {
            const margin =
              product.price > 0
                ? Math.round(((product.price - product.costPrice) / product.price) * 100)
                : 0;
            return (
              <div
                key={product.id}
                className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden"
              >
                {/* Stock colour strip */}
                <div className={`h-1.5 w-full ${
                  product.stock === 0 ? "bg-rose-400" : product.stock < 10 ? "bg-amber-400" : "bg-emerald-400"
                }`} />

                <div className="p-4 flex flex-col gap-3 flex-1">
                  {/* Name + category */}
                  <div>
                    <h3 className="font-extrabold text-slate-800 leading-tight line-clamp-2 text-sm" style={{ fontFamily: "var(--font-jakarta)" }}>
                      {product.name}
                    </h3>
                    {product.category && (
                      <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                        {product.category.name}
                      </span>
                    )}
                  </div>

                  {/* SKU + barcode */}
                  <div className="text-[11px] font-mono text-slate-500 space-y-0.5">
                    <div>SKU: {product.sku}</div>
                    {product.barcode && <div>Barcode: {product.barcode}</div>}
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 rounded-lg px-2.5 py-2">
                      <p className="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">Price</p>
                      <p className="font-bold text-slate-800 text-sm">${Number(product.price).toFixed(2)}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg px-2.5 py-2">
                      <p className="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">Cost</p>
                      <p className="font-bold text-slate-800 text-sm">${Number(product.costPrice).toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Stock + margin */}
                  <div className="flex items-center justify-between">
                    {stockBadge(product.stock)}
                    <span className="text-[10px] text-slate-400 font-medium">{margin}% margin</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="border-t border-slate-100 grid grid-cols-3 divide-x divide-slate-100">
                  <button
                    onClick={() => { setRestockTarget(product); setRestockQty(""); }}
                    className="flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    <PackagePlusIcon className="w-3.5 h-3.5" />
                    Restock
                  </button>
                  <button
                    onClick={() => setEditTarget(product)}
                    className="flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <PencilIcon className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold text-rose-500 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2Icon className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Product Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <ProductForm
              initial={editTarget}
              onSuccess={handleUpdated}
              onCancel={() => setEditTarget(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Restock Dialog */}
      <Dialog open={!!restockTarget} onOpenChange={(open) => !open && setRestockTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Restock — {restockTarget?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <p className="text-sm text-muted-foreground">
              Current stock: <strong>{restockTarget?.stock}</strong>
            </p>
            <Input
              type="number"
              min="1"
              placeholder="Quantity to add"
              value={restockQty}
              onChange={(e) => setRestockQty(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleRestock}
                disabled={restockLoading || !restockQty}
                className="bg-emerald-500 hover:bg-emerald-600 text-white active:scale-[.98] transition-all"
              >
                {restockLoading ? "Saving…" : "✅ Confirm Restock"}
              </Button>
              <Button variant="outline" onClick={() => setRestockTarget(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
