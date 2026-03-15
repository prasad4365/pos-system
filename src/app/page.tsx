"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { SessionUser } from "@/lib/auth";

const ALL_SECTIONS = [
  {
    href: "/dashboard",
    icon: "📊",
    title: "Dashboard",
    description: "View daily sales, revenue trends and low stock alerts.",
    gradient: "from-amber-500 to-orange-500",
    bg: "hover:bg-amber-50 border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    adminOnly: false,
  },
  {
    href: "/pos",
    icon: "🛒",
    title: "Point of Sale",
    description: "Serve customers, search products, manage cart and process checkout.",
    gradient: "from-indigo-500 to-violet-500",
    bg: "hover:bg-indigo-50 border-indigo-200",
    badge: "bg-indigo-100 text-indigo-700",
    adminOnly: false,
  },
  {
    href: "/inventory/products",
    icon: "📦",
    title: "Products",
    description: "Add, edit, delete products and manage stock levels.",
    gradient: "from-emerald-500 to-teal-500",
    bg: "hover:bg-emerald-50 border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
    adminOnly: true,
  },
  {
    href: "/inventory/categories",
    icon: "🗂️",
    title: "Categories",
    description: "Organise products into categories for easy browsing.",
    gradient: "from-purple-500 to-pink-500",
    bg: "hover:bg-purple-50 border-purple-200",
    badge: "bg-purple-100 text-purple-700",
    adminOnly: true,
  },
  {
    href: "/admin/users",
    icon: "👥",
    title: "Users",
    description: "Register and manage cashier accounts and roles.",
    gradient: "from-rose-500 to-pink-500",
    bg: "hover:bg-rose-50 border-rose-200",
    badge: "bg-rose-100 text-rose-700",
    adminOnly: true,
  },
];

export default function HomePage() {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then(setUser)
      .catch(() => null);
  }, []);

  const sections = ALL_SECTIONS.filter(
    (s) => !s.adminOnly || user?.role === "ADMIN"
  );

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50">
      {/* Hero banner */}
      <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 text-white">
        <div className="max-w-4xl mx-auto px-6 py-14">
          <p className="text-indigo-200 text-sm font-semibold uppercase tracking-widest mb-2">
            Welcome back{user?.name ? `, ${user.name}` : ""} 👋
          </p>
          <h1
            className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            POS &amp; Inventory
          </h1>
          <p className="text-indigo-200 text-lg max-w-md">
            Your all-in-one point of sale and inventory management system.
            Fast, reliable, and easy to use.
          </p>
        </div>
      </div>

      {/* Section cards */}
      <main className="max-w-4xl mx-auto w-full px-6 -mt-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className={`group rounded-2xl border bg-white p-5 transition-all duration-200 ${s.bg} hover:shadow-lg hover:-translate-y-0.5 active:scale-[.98] flex flex-col gap-4`}
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-2xl shadow-sm`}
              >
                {s.icon}
              </div>

              <div className="flex-1">
                <h3
                  className="font-bold text-base text-slate-800 mb-1"
                  style={{ fontFamily: "var(--font-jakarta)" }}
                >
                  {s.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {s.description}
                </p>
              </div>

              <span
                className={`self-start text-xs font-semibold px-2.5 py-1 rounded-full ${s.badge} group-hover:opacity-80 transition-opacity`}
              >
                Open →
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

