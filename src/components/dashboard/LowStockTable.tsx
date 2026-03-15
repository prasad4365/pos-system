"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  stock: number;
  category: { name: string } | null;
}

export default function LowStockTable() {
  const [items, setItems] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/low-stock?threshold=5")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setItems(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function stockBadge(stock: number) {
    if (stock === 0)
      return <Badge variant="destructive">Out of Stock</Badge>;
    return (
      <Badge variant="outline" className="border-orange-400 text-orange-600">
        {stock} left
      </Badge>
    );
  }

  if (loading) {
    return (
      <div className="space-y-2 p-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-2">
            <div className="h-4 w-48 rounded bg-slate-200 animate-pulse" />
            <div className="h-4 w-20 rounded bg-slate-100 animate-pulse" />
            <div className="h-4 w-24 rounded bg-slate-100 animate-pulse ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        ✅ All products are sufficiently stocked.
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-center">Stock</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {item.sku}
                </TableCell>
                <TableCell>{item.category?.name ?? "—"}</TableCell>
                <TableCell className="text-center">{stockBadge(item.stock)}</TableCell>
                <TableCell className="text-right">
                  <Link href="/inventory/products">
                    <Button size="sm" variant="outline">
                      Restock
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
