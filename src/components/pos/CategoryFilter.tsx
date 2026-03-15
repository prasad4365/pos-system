"use client";

import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal, X, Check, Search } from "lucide-react";
import type { Category } from "@/types";

interface CategoryFilterProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function CategoryFilter({ selectedIds, onChange }: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Fetch categories once
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) ? setCategories(d) : [])
      .catch(() => null);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function toggleCategory(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((s) => s !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  function clearAll() {
    onChange([]);
    setSearch("");
  }

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = selectedIds.length;

  return (
    <div ref={dropdownRef} className="relative shrink-0">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        title="Filter by category"
        className={`relative flex items-center justify-center h-10 w-10 rounded-lg border transition-all duration-150 shadow-sm ${
          open || activeCount > 0
            ? "bg-indigo-600 text-white border-indigo-600 shadow-indigo-200"
            : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" />
        {activeCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center shadow">
            {activeCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 z-50 w-64 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-3 pt-3 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Filter by Category
            </span>
            {activeCount > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-rose-500 hover:text-rose-700 font-semibold transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          {/* Search input */}
          <div className="px-3 py-2 border-b border-slate-100 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search categories…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-6 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:bg-white transition-colors"
            />
          </div>

          {/* Category list */}
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No categories found</p>
            ) : (
              filtered.map((cat) => {
                const selected = selectedIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors ${
                      selected
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-medium">{cat.name}</span>
                    {selected && (
                      <span className="w-4 h-4 rounded bg-indigo-600 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer: selected tags */}
          {activeCount > 0 && (
            <div className="px-3 py-2 border-t border-slate-100 flex flex-wrap gap-1.5">
              {selectedIds.map((id) => {
                const cat = categories.find((c) => c.id === id);
                if (!cat) return null;
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full"
                  >
                    {cat.name}
                    <button
                      onClick={() => toggleCategory(id)}
                      className="hover:text-rose-600 transition-colors"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
