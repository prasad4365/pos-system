"use client";

import { useCallback, useState } from "react";
import ProductSearch from "@/components/pos/ProductSearch";
import ProductGrid from "@/components/pos/ProductGrid";
import CartPanel from "@/components/pos/CartPanel";
import CategoryFilter from "@/components/pos/CategoryFilter";
import type { Product } from "@/types";

type StockFilter = "all" | "in-stock" | "low-stock" | "out-of-stock";

const STOCK_CHIPS: { key: StockFilter; label: string; idle: string; active: string }[] = [
  { key: "all",          label: "All Stock",     idle: "bg-slate-100 text-slate-600 hover:bg-slate-200",      active: "bg-slate-700 text-white" },
  { key: "in-stock",     label: "In Stock",      idle: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100", active: "bg-emerald-500 text-white" },
  { key: "low-stock",    label: "Low Stock",     idle: "bg-amber-50 text-amber-700 hover:bg-amber-100",       active: "bg-amber-500 text-white" },
  { key: "out-of-stock", label: "Out of Stock",  idle: "bg-rose-50 text-rose-600 hover:bg-rose-100",          active: "bg-rose-500 text-white" },
];

export default function POSPage() {
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(true);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");

  const handleResults = useCallback((products: Product[]) => {
    setResults(products);
    setSearched(true);
  }, []);

  const handleLoading = useCallback((isLoading: boolean) => {
    setLoading(isLoading);
  }, []);

  // Filter client-side by category + stock status
  const filteredResults = results.filter((p) => {
    const matchCat = selectedCategoryIds.length === 0 || selectedCategoryIds.includes(p.categoryId);
    const matchStock =
      stockFilter === "all" ||
      (stockFilter === "out-of-stock" && p.stock === 0) ||
      (stockFilter === "low-stock"    && p.stock > 0 && p.stock < 10) ||
      (stockFilter === "in-stock"     && p.stock >= 10);
    return matchCat && matchStock;
  });

  return (
    <div className="flex h-full gap-0">
      {/* Left panel — product search + grid */}
      <div className="flex-1 flex flex-col overflow-hidden p-4 gap-2">
        {/* Search + category filter + stock chips — all in one row */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <ProductSearch onResults={handleResults} onLoading={handleLoading} />
          </div>
          <CategoryFilter
            selectedIds={selectedCategoryIds}
            onChange={setSelectedCategoryIds}
          />
          {STOCK_CHIPS.map(({ key, label, idle, active }) => (
            <button
              key={key}
              onClick={() => setStockFilter(key)}
              className={`h-10 px-3 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                stockFilter === key ? active : idle
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          <ProductGrid
            products={filteredResults}
            loading={loading}
            searched={searched}
          />
        </div>
      </div>

      {/* Right panel — cart */}
      <div className="w-80 xl:w-96 shrink-0 border-l border-slate-200 bg-white flex flex-col overflow-hidden p-3">
        <CartPanel />
      </div>
    </div>
  );
}
