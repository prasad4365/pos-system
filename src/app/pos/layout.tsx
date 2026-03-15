import type { ReactNode } from "react";

export default function POSLayout({ children }: { children: ReactNode }) {
  // h-[calc(100vh-3.5rem)] accounts for the global 3.5rem (h-14) AppNavbar
  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-slate-50 overflow-hidden">
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

