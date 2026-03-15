"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import type { Product } from "@/types";

interface ProductSearchProps {
  onResults: (products: Product[]) => void;
  onLoading: (loading: boolean) => void;
}

export default function ProductSearch({ onResults, onLoading }: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Buffer for rapid scanner keystrokes
  const scannerBufferRef = useRef("");
  const lastKeyTimeRef = useRef<number>(0);

  // Fetch all products (called on mount and when query is cleared)
  async function fetchAll() {
    onLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      onResults(Array.isArray(data) ? data : []);
    } catch {
      onResults([]);
    } finally {
      onLoading(false);
    }
  }

  // Load all products on first render
  useEffect(() => {
    fetchAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search for typed input
  useEffect(() => {
    if (!query.trim()) {
      fetchAll();
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      onLoading(true);
      try {
        const res = await fetch(
          `/api/products/search?q=${encodeURIComponent(query.trim())}`
        );
        const data = await res.json();
        onResults(Array.isArray(data) ? data : []);
      } catch {
        onResults([]);
      } finally {
        onLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Barcode scanner detection: rapid consecutive keystrokes ending with Enter
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const now = Date.now();
    const timeSinceLast = now - lastKeyTimeRef.current;
    lastKeyTimeRef.current = now;

    if (e.key === "Enter") {
      const barcode = scannerBufferRef.current;
      scannerBufferRef.current = "";
      if (barcode.length >= 4) {
        // Treat as barcode scan — search immediately
        setQuery(barcode);
      }
      return;
    }

    // If keystrokes are < 50ms apart, it's a scanner
    if (timeSinceLast < 50 && e.key.length === 1) {
      scannerBufferRef.current += e.key;
    } else {
      scannerBufferRef.current = e.key.length === 1 ? e.key : "";
    }
  }

  return (
    <div className="relative">
      <Input
        type="search"
        placeholder="🔍 Search by name, SKU or scan barcode…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="h-11 text-base pr-4 border-slate-200 focus:border-indigo-400 focus:ring-indigo-300 bg-white shadow-sm"
        autoFocus
        autoComplete="off"
      />
      {query && (
        <button
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-rose-500 text-sm transition-colors"
          onClick={() => { setQuery(""); fetchAll(); }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
