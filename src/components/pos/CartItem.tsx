"use client";

import { useCartStore, type CartItem as CartItemType } from "@/hooks/useCartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { removeFromCart, updateQuantity } = useCartStore();
  const { product, quantity, unitPrice } = item;
  const lineTotal = (unitPrice * quantity).toFixed(2);

  return (
    <div className="flex items-center gap-2 py-2 px-1 rounded-lg hover:bg-indigo-50/50 group transition-colors">
      {/* Product info */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-bold leading-tight truncate text-slate-800"
          style={{ fontFamily: "var(--font-jakarta)" }}
        >
          {product.name}
        </p>
        <p className="text-xs text-muted-foreground">${unitPrice.toFixed(2)} each</p>
      </div>

      {/* Quantity control */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 text-base hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 active:scale-90 transition-all"
          onClick={() => updateQuantity(product.id, quantity - 1)}
        >
          −
        </Button>
        <Input
          type="number"
          min="1"
          max={product.stock}
          value={quantity}
          onChange={(e) => updateQuantity(product.id, Number(e.target.value))}
          className="h-7 w-12 text-center text-sm px-1 font-semibold"
        />
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 text-base hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 active:scale-90 transition-all"
          onClick={() => updateQuantity(product.id, quantity + 1)}
          disabled={quantity >= product.stock}
        >
          +
        </Button>
      </div>

      {/* Line total */}
      <span className="text-sm font-bold w-14 text-right shrink-0 text-indigo-700">
        ${lineTotal}
      </span>

      {/* Remove */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all active:scale-90"
        onClick={() => removeFromCart(product.id)}
      >
        ✕
      </Button>
    </div>
  );
}
