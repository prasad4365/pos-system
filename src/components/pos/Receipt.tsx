"use client";

import { forwardRef } from "react";
import type { OrderResponse } from "@/types";

interface ReceiptProps {
  order: OrderResponse;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  grandTotal: number;
  cashGiven?: number;
  balance?: number;
  storeName?: string;
}

// This component is forwarded a ref so react-to-print can target it.
// Width is locked to 300px (≈80mm) and uses print-safe monospace styling.
const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(function Receipt(
  {
    order,
    subtotal,
    discountPercent,
    discountAmount,
    taxPercent,
    taxAmount,
    grandTotal,
    cashGiven,
    balance,
    storeName = "My POS Store",
  },
  ref
) {
  const date = new Date(order.createdAt);
  const dateStr = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const dashes = "─".repeat(32);

  return (
    <div
      ref={ref}
      style={{
        width: "300px",
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: "12px",
        lineHeight: "1.5",
        color: "#000",
        backgroundColor: "#fff",
        padding: "16px 12px",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <div style={{ fontSize: "16px", fontWeight: "bold", letterSpacing: "1px" }}>
          {storeName}
        </div>
        <div style={{ fontSize: "10px", marginTop: "2px" }}>Point of Sale System</div>
        <div style={{ marginTop: "6px", fontSize: "11px" }}>
          {dateStr} • {timeStr}
        </div>
        <div style={{ fontWeight: "bold", marginTop: "2px" }}>
          {order.orderNumber}
        </div>
      </div>

      <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />

      {/* Items */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontWeight: "bold",
            fontSize: "11px",
            marginBottom: "4px",
          }}
        >
          <span style={{ flex: 1 }}>ITEM</span>
          <span style={{ width: "30px", textAlign: "center" }}>QTY</span>
          <span style={{ width: "50px", textAlign: "right" }}>PRICE</span>
          <span style={{ width: "55px", textAlign: "right" }}>TOTAL</span>
        </div>
        <div style={{ borderTop: "1px dashed #000", marginBottom: "6px" }} />

        {order.items.map((item) => {
          const lineTotal = item.unitPrice * item.quantity;
          return (
            <div key={item.id} style={{ marginBottom: "4px" }}>
              <div style={{ fontWeight: "bold", fontSize: "11px" }}>
                {item.product.name}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "11px",
                  paddingLeft: "4px",
                }}
              >
                <span style={{ flex: 1, color: "#555" }}>{item.product.sku}</span>
                <span style={{ width: "30px", textAlign: "center" }}>
                  {item.quantity}
                </span>
                <span style={{ width: "50px", textAlign: "right" }}>
                  ${item.unitPrice.toFixed(2)}
                </span>
                <span style={{ width: "55px", textAlign: "right", fontWeight: "bold" }}>
                  ${lineTotal.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />

      {/* Totals */}
      <div style={{ fontSize: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        {discountAmount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
            <span>Discount ({discountPercent}%)</span>
            <span>-${discountAmount.toFixed(2)}</span>
          </div>
        )}

        {taxAmount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
            <span>Tax ({taxPercent}%)</span>
            <span>+${taxAmount.toFixed(2)}</span>
          </div>
        )}

        <div style={{ borderTop: "1px solid #000", marginTop: "4px", paddingTop: "4px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            <span>TOTAL</span>
            <span>${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />

      {/* Payment */}
      <div style={{ fontSize: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
          <span>Payment Method</span>
          <span style={{ fontWeight: "bold" }}>{order.paymentMethod}</span>
        </div>
        {order.paymentMethod === "CASH" && cashGiven !== undefined && cashGiven > 0 && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
              <span>Cash Given</span>
              <span style={{ fontWeight: "bold" }}>${cashGiven.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
              <span>Balance / Change</span>
              <span style={{ fontWeight: "bold" }}>${(balance ?? 0).toFixed(2)}</span>
            </div>
          </>
        )}
      </div>

      <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }} />

      {/* Footer */}
      <div style={{ textAlign: "center", fontSize: "11px", color: "#333" }}>
        <div>Thank you for your purchase!</div>
        <div style={{ marginTop: "2px" }}>Please come again 🙏</div>
        <div style={{ marginTop: "6px", fontSize: "10px", color: "#666" }}>
          {dashes}
        </div>
        <div style={{ fontSize: "10px", color: "#666", marginTop: "2px" }}>
          Cashier: {order.user?.name ?? "Cashier"}
        </div>
      </div>

      {/* Extra space for paper tear */}
      <div style={{ height: "24px" }} />
    </div>
  );
});

export default Receipt;
