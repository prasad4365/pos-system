import type { ReactNode } from "react";

export default function InventoryLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50">
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}

