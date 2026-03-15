"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category, Product } from "@/types";

interface ProductFormProps {
  initial?: Product;
  onSuccess: (product: Product) => void;
  onCancel?: () => void;
}

type FormState = {
  name: string;
  sku: string;
  barcode: string;
  price: string;
  costPrice: string;
  stock: string;
  categoryId: string;
};

const EMPTY: FormState = {
  name: "",
  sku: "",
  barcode: "",
  price: "",
  costPrice: "",
  stock: "0",
  categoryId: "",
};

export default function ProductForm({
  initial,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const [form, setForm] = useState<FormState>(
    initial
      ? {
          name: initial.name,
          sku: initial.sku,
          barcode: initial.barcode ?? "",
          price: String(initial.price),
          costPrice: String(initial.costPrice),
          stock: String(initial.stock),
          categoryId: initial.categoryId,
        }
      : EMPTY
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!initial;

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(
        isEditing ? `/api/products/${initial.id}` : "/api/products",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            price: Number(form.price),
            costPrice: Number(form.costPrice),
            stock: Number(form.stock),
            barcode: form.barcode || null,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      onSuccess(data as Product);
      if (!isEditing) setForm(EMPTY);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      {/* Name */}
      <div className="grid gap-1.5">
        <Label htmlFor="p-name">Product Name *</Label>
        <Input id="p-name" value={form.name} onChange={set("name")} placeholder="e.g. Coca-Cola 330ml" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* SKU */}
        <div className="grid gap-1.5">
          <Label htmlFor="p-sku">SKU *</Label>
          <Input id="p-sku" value={form.sku} onChange={set("sku")} placeholder="e.g. BEV-001" required />
        </div>

        {/* Barcode */}
        <div className="grid gap-1.5">
          <Label htmlFor="p-barcode">Barcode</Label>
          <Input id="p-barcode" value={form.barcode} onChange={set("barcode")} placeholder="e.g. 6001234567890" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Price */}
        <div className="grid gap-1.5">
          <Label htmlFor="p-price">Selling Price *</Label>
          <Input id="p-price" type="number" min="0" step="0.01" value={form.price} onChange={set("price")} placeholder="0.00" required />
        </div>

        {/* Cost Price */}
        <div className="grid gap-1.5">
          <Label htmlFor="p-cost">Cost Price *</Label>
          <Input id="p-cost" type="number" min="0" step="0.01" value={form.costPrice} onChange={set("costPrice")} placeholder="0.00" required />
        </div>

        {/* Stock */}
        <div className="grid gap-1.5">
          <Label htmlFor="p-stock">Initial Stock</Label>
          <Input id="p-stock" type="number" min="0" value={form.stock} onChange={set("stock")} placeholder="0" />
        </div>
      </div>

      {/* Category */}
      <div className="grid gap-1.5">
        <Label>Category *</Label>
        <Select
          value={form.categoryId}
          onValueChange={(v) => setForm((prev) => ({ ...prev, categoryId: v ?? "" }))}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving…" : isEditing ? "Update Product" : "Add Product"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
