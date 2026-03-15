import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Product } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number; // locked at time of adding
}

export interface CartState {
  items: CartItem[];

  // Computed totals (derived, updated reactively)
  subtotal: number;
  discountAmount: number;
  discountPercent: number;
  taxPercent: number;
  taxAmount: number;
  grandTotal: number;

  // Actions
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setDiscount: (percent: number) => void;
  setTax: (percent: number) => void;
  clearCart: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeTotals(
  items: CartItem[],
  discountPercent: number,
  taxPercent: number
) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const discountAmount = parseFloat(
    ((subtotal * discountPercent) / 100).toFixed(2)
  );
  const taxable = subtotal - discountAmount;
  const taxAmount = parseFloat(((taxable * taxPercent) / 100).toFixed(2));
  const grandTotal = parseFloat((taxable + taxAmount).toFixed(2));

  return { subtotal, discountAmount, taxAmount, grandTotal };
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCartStore = create<CartState>()(
  devtools(
    (set, get) => ({
      items: [],
      subtotal: 0,
      discountAmount: 0,
      discountPercent: 0,
      taxPercent: 0,
      taxAmount: 0,
      grandTotal: 0,

      addToCart(product) {
        const { items, discountPercent, taxPercent } = get();
        const existing = items.find((i) => i.product.id === product.id);

        let next: CartItem[];
        if (existing) {
          // Check stock ceiling
          const newQty = Math.min(
            existing.quantity + 1,
            product.stock
          );
          next = items.map((i) =>
            i.product.id === product.id ? { ...i, quantity: newQty } : i
          );
        } else {
          if (product.stock === 0) return; // out of stock
          next = [...items, { product, quantity: 1, unitPrice: product.price }];
        }

        const totals = computeTotals(next, discountPercent, taxPercent);
        set({ items: next, ...totals });
      },

      removeFromCart(productId) {
        const { items, discountPercent, taxPercent } = get();
        const next = items.filter((i) => i.product.id !== productId);
        const totals = computeTotals(next, discountPercent, taxPercent);
        set({ items: next, ...totals });
      },

      updateQuantity(productId, quantity) {
        const { items, discountPercent, taxPercent } = get();
        if (quantity <= 0) {
          const next = items.filter((i) => i.product.id !== productId);
          const totals = computeTotals(next, discountPercent, taxPercent);
          set({ items: next, ...totals });
          return;
        }
        const next = items.map((i) => {
          if (i.product.id !== productId) return i;
          return { ...i, quantity: Math.min(quantity, i.product.stock) };
        });
        const totals = computeTotals(next, discountPercent, taxPercent);
        set({ items: next, ...totals });
      },

      setDiscount(percent) {
        const { items, taxPercent } = get();
        const discountPercent = Math.max(0, Math.min(100, percent));
        const totals = computeTotals(items, discountPercent, taxPercent);
        set({ discountPercent, ...totals });
      },

      setTax(percent) {
        const { items, discountPercent } = get();
        const taxPercent = Math.max(0, Math.min(100, percent));
        const totals = computeTotals(items, discountPercent, taxPercent);
        set({ taxPercent, ...totals });
      },

      clearCart() {
        set({
          items: [],
          subtotal: 0,
          discountAmount: 0,
          taxAmount: 0,
          grandTotal: 0,
          discountPercent: 0,
          taxPercent: 0,
        });
      },
    }),
    { name: "cart-store" }
  )
);
