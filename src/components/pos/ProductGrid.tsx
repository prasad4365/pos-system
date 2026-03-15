"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/hooks/useCartStore";
import type { Product } from "@/types";
import { toast } from "sonner";

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  searched: boolean;
}

export default function ProductGrid({
  products,
  loading,
  searched,
}: ProductGridProps) {
  const addToCart = useCartStore((s) => s.addToCart);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-lg bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!searched) {
    return (
      <div className="flex flex-col items-center justify-center mt-16 gap-3 select-none">
        <span className="text-5xl">🔍</span>
        <p className="text-base font-semibold text-slate-600" style={{ fontFamily: "var(--font-jakarta)" }}>Find a product</p>
        <p className="text-sm text-muted-foreground">Start typing or scan a barcode to begin.</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center mt-16 gap-3 select-none">
        <span className="text-5xl">😕</span>
        <p className="text-base font-semibold text-slate-600" style={{ fontFamily: "var(--font-jakarta)" }}>No products found</p>
        <p className="text-sm text-muted-foreground">Try a different search term or barcode.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
      {products.map((product) => {
        const outOfStock = product.stock === 0;
        return (
          <Card
            key={product.id}
            onClick={() => {
              if (outOfStock) return;
              addToCart(product);
              toast.success(`${product.name} added to cart`, {
                description: `$${Number(product.price).toFixed(2)} · ${product.stock - 1} left in stock`,
                duration: 2000,
              });
            }}
            className={`cursor-pointer transition-all duration-150 select-none border ${
              outOfStock
                ? "opacity-50 cursor-not-allowed bg-slate-50"
                : "hover:border-indigo-400 hover:shadow-md hover:-translate-y-0.5 active:scale-95"
            }`}
          >
            <CardContent className="p-3 flex flex-col gap-1.5">
              <p
                className="font-bold text-sm leading-tight line-clamp-2 text-slate-800"
                style={{ fontFamily: "var(--font-jakarta)" }}
              >
                {product.name}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {product.sku}
              </p>
              <div className="flex items-center justify-between mt-auto pt-1">
                <span className="font-extrabold text-base text-indigo-700">
                  ${Number(product.price).toFixed(2)}
                </span>
                {outOfStock ? (
                  <Badge variant="destructive" className="text-xs">
                    Out
                  </Badge>
                ) : (
                  <Badge className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                    {product.stock}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
