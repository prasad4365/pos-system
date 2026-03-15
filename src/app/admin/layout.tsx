import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="p-6 max-w-5xl mx-auto">{children}</div>;
}
