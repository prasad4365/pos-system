"use client";

import { useCartStore } from "@/hooks/useCartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import CartItem from "./CartItem";
import Receipt from "./Receipt";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrderResponse } from "@/types";
import { toast } from "sonner";

export default function CartPanel() {
  const {
    items,
    subtotal,
    discountPercent,
    discountAmount,
    taxPercent,
    taxAmount,
    grandTotal,
    setDiscount,
    setTax,
    clearCart,
  } = useCartStore();

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [cashGiven, setCashGiven] = useState("");
  const [processing, setProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<OrderResponse | null>(null);

  // Snapshot totals at time of checkout (cart is cleared after success)
  const [receiptTotals, setReceiptTotals] = useState({
    subtotal: 0,
    discountPercent: 0,
    discountAmount: 0,
    taxPercent: 0,
    taxAmount: 0,
    grandTotal: 0,
    cashGiven: 0,
    balance: 0,
  });

  const receiptRef = useRef<HTMLDivElement>(null);

  const printReceipt = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: completedOrder ? `Receipt-${completedOrder.orderNumber}` : "Receipt",
    pageStyle: `
      @page { size: 80mm auto; margin: 0; }
      @media print {
        body { margin: 0; }
        * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    `,
  });

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  async function handleCheckout() {
    if (items.length === 0) return;

    // Validate cash given
    const cashGivenNum = parseFloat(cashGiven);
    if (paymentMethod === "CASH") {
      if (!cashGiven || isNaN(cashGivenNum) || cashGivenNum < grandTotal) {
        setCheckoutError(`Cash given must be at least $${grandTotal.toFixed(2)}.`);
        return;
      }
    }

    setProcessing(true);
    setCheckoutError(null);

    const balance = paymentMethod === "CASH" ? cashGivenNum - grandTotal : 0;
    // Snapshot totals before clearing the cart
    const snap = { subtotal, discountPercent, discountAmount, taxPercent, taxAmount, grandTotal, cashGiven: cashGivenNum, balance };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod,
          items: items.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
          totalAmount: subtotal,
          payableAmount: grandTotal,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCheckoutError(data.error ?? "Checkout failed.");
        return;
      }

      setReceiptTotals(snap);
      setCompletedOrder(data as OrderResponse);
      clearCart();
      toast.success("Checkout successful! 🎉", {
        description: `Order ${(data as OrderResponse).orderNumber} · $${snap.grandTotal.toFixed(2)} via ${paymentMethod}`,
      });
    } catch {
      setCheckoutError("Network error. Please try again.");
      toast.error("Network error", { description: "Could not connect to server. Please try again." });
    } finally {
      setProcessing(false);
    }
  }

  function handleNewSale() {
    setCompletedOrder(null);
    setCheckoutError(null);
    setCheckoutOpen(false);
    setPaymentMethod("CASH");
    setCashGiven("");
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between bg-slate-50 rounded-t-xl">
        <h2
          className="font-extrabold text-base text-slate-800"
          style={{ fontFamily: "var(--font-jakarta)" }}
        >
          Cart
        </h2>
        {itemCount > 0 && (
          <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-100">
            {itemCount} item{itemCount !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Cart items */}
      <ScrollArea className="flex-1 min-h-0 px-3 py-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3 select-none">
            <span className="text-5xl">🛒</span>
            <p className="font-semibold text-slate-600 text-sm" style={{ fontFamily: "var(--font-jakarta)" }}>Cart is empty</p>
            <p className="text-xs text-muted-foreground text-center">Click a product on the left to add it to the cart.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {items.map((item) => (
              <CartItem key={item.product.id} item={item} />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Discount & Tax controls */}
      {items.length > 0 && (
        <div className="px-4 py-2 border-t space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground w-16 shrink-0">Discount %</span>
              <Input
                type="number"
                min="0"
                max="100"
                step="1"
                value={discountPercent}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="h-8 text-sm"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground w-16 shrink-0">Tax %</span>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={taxPercent}
                onChange={(e) => setTax(Number(e.target.value))}
                className="h-8 text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Totals */}
      <div className="px-4 py-3 border-t space-y-1 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount ({discountPercent}%)</span>
            <span>-${discountAmount.toFixed(2)}</span>
          </div>
        )}
        {taxAmount > 0 && (
          <div className="flex justify-between text-muted-foreground">
            <span>Tax ({taxPercent}%)</span>
            <span>+${taxAmount.toFixed(2)}</span>
          </div>
        )}
        <Separator className="my-2" />
        <div className="flex justify-between font-extrabold text-xl text-indigo-700">
          <span>Total</span>
          <span>${grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t space-y-2">
        <Button
          className="w-full h-12 text-base font-bold bg-emerald-500 hover:bg-emerald-600 active:scale-[.98] text-white shadow-sm transition-all duration-150"
          disabled={items.length === 0}
          onClick={() => { setCompletedOrder(null); setCheckoutError(null); setCheckoutOpen(true); }}
        >
          💳 Checkout — ${grandTotal.toFixed(2)}
        </Button>
        {items.length > 0 && (
          <Button
            variant="outline"
            className="w-full h-8 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 transition-colors"
            onClick={() => { if (confirm("Clear the cart?")) { clearCart(); toast.info("Cart cleared."); } }}
          >
            Clear Cart
          </Button>
        )}
      </div>

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={(open) => { if (!open) handleNewSale(); }}>
        <DialogContent className={completedOrder ? "max-w-sm p-0 overflow-hidden" : "max-w-sm"}>
          <DialogHeader className={completedOrder ? "px-4 pt-4 pb-0" : undefined}>
            <DialogTitle>
              {completedOrder ? `✓ Order ${completedOrder.orderNumber}` : "Confirm Checkout"}
            </DialogTitle>
          </DialogHeader>

          {/* ── SUCCESS: Show Receipt + Print button ── */}
          {completedOrder ? (
            <div className="flex flex-col items-center">
              {/* Scrollable receipt preview */}
              <div className="max-h-[70vh] overflow-y-auto w-full flex justify-center bg-gray-50 border-t border-b py-3">
                <Receipt
                  ref={receiptRef}
                  order={completedOrder}
                  subtotal={receiptTotals.subtotal}
                  discountPercent={receiptTotals.discountPercent}
                  discountAmount={receiptTotals.discountAmount}
                  taxPercent={receiptTotals.taxPercent}
                  taxAmount={receiptTotals.taxAmount}
                  grandTotal={receiptTotals.grandTotal}
                  cashGiven={receiptTotals.cashGiven}
                  balance={receiptTotals.balance}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 w-full px-4 py-4">
                <Button
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white active:scale-[.98] transition-all"
                  onClick={() => printReceipt()}
                >
                  🖶 Print Receipt
                </Button>
                <Button variant="outline" className="flex-1 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-colors" onClick={handleNewSale}>
                  New Sale
                </Button>
              </div>
            </div>
          ) : (
            /* ── PENDING: Confirm checkout ── */
            <div className="space-y-4 py-2">
              {/* Order summary */}
              <div className="rounded-lg bg-muted p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items</span>
                  <span>{itemCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>+${taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <Separator className="my-1" />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment method */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Payment Method</label>
                <Select value={paymentMethod} onValueChange={(v) => { if (v) { setPaymentMethod(v); setCashGiven(""); setCheckoutError(null); } }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                    <SelectItem value="MOBILE">Mobile Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Cash given — only for CASH payments */}
              {paymentMethod === "CASH" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Cash Given by Customer</label>
                  <Input
                    type="number"
                    min={grandTotal}
                    step="0.01"
                    placeholder={`Min $${grandTotal.toFixed(2)}`}
                    value={cashGiven}
                    onChange={(e) => { setCashGiven(e.target.value); setCheckoutError(null); }}
                    className="h-10"
                    autoFocus
                  />
                  {cashGiven && !isNaN(parseFloat(cashGiven)) && parseFloat(cashGiven) >= grandTotal && (
                    <div className="flex justify-between text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                      <span>Balance / Change</span>
                      <span>${(parseFloat(cashGiven) - grandTotal).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}

              {checkoutError && (
                <p className="text-sm text-red-500">{checkoutError}</p>
              )}

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold active:scale-[.98] transition-all"
                  onClick={handleCheckout}
                  disabled={processing}
                >
                  {processing ? "Processing…" : "✓ Confirm Sale"}
                </Button>
                <Button variant="outline" onClick={() => setCheckoutOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
