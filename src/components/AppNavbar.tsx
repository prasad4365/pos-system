"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCartStore } from "@/hooks/useCartStore";
import { useEffect, useState } from "react";
import type { SessionUser } from "@/lib/auth";

const ALL_NAV_LINKS = [
  { href: "/dashboard",            label: "Dashboard",  icon: "📊", adminOnly: false },
  { href: "/pos",                  label: "POS",        icon: "🛒", adminOnly: false },
  { href: "/inventory/products",   label: "Products",   icon: "📦", adminOnly: true  },
  { href: "/inventory/categories", label: "Categories", icon: "🗂️", adminOnly: true  },
  { href: "/admin/users",          label: "Users",      icon: "👥", adminOnly: true  },
];

export default function AppNavbar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const clearCart = useCartStore((s) => s.clearCart);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then(setUser)
      .catch(() => setUser(null));
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    clearCart();
    router.push("/login");
    router.refresh();
  }

  // When navigating AWAY from POS, offer to clear the cart
  function handleNav(href: string, e: React.MouseEvent) {
    if (pathname.startsWith("/pos") && !href.startsWith("/pos")) {
      const cartItems = useCartStore.getState().items;
      if (cartItems.length > 0) {
        e.preventDefault();
        if (confirm("You have items in your cart. Clear cart and leave POS?")) {
          clearCart();
          router.push(href);
        }
        return;
      }
    }
  }

  return (
    <header className="sticky top-0 shrink-0 z-50 bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-2">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 mr-5 text-white hover:opacity-90 transition-opacity"
          style={{ fontFamily: "var(--font-jakarta)" }}
        >
          <span className="text-xl">🏪</span>
          <span className="hidden sm:inline font-extrabold text-lg tracking-tight">POS System</span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1 flex-1">
          {ALL_NAV_LINKS
            .filter((link) => !link.adminOnly || user?.role === "ADMIN")
            .map((link) => {
            const isActive =
              link.href === "/pos"
                ? pathname.startsWith("/pos")
                : link.href === "/dashboard"
                ? pathname.startsWith("/dashboard")
                : link.href === "/admin/users"
                ? pathname.startsWith("/admin")
                : link.href === "/inventory/products"
                ? pathname === "/inventory/products"
                : link.href === "/inventory/categories"
                ? pathname === "/inventory/categories"
                : pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleNav(link.href, e)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                  isActive
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-indigo-100 hover:text-white hover:bg-white/15 active:scale-95"
                }`}
              >
                <span className="text-base leading-none">{link.icon}</span>
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Cart badge (only visible on non-POS pages as a shortcut) */}
        <CartBadge />

        {/* User info + logout */}
        {user && (
          <div className="flex items-center gap-2 ml-3 pl-3 border-l border-indigo-500">
            <div className="hidden sm:flex flex-col items-end leading-none">
              <span className="text-white text-xs font-semibold">{user.name}</span>
              <span className={`text-[10px] font-bold mt-0.5 ${
                user.role === "ADMIN" ? "text-yellow-300" : "text-indigo-200"
              }`}>{user.role}</span>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-100 hover:text-white hover:bg-white/15 transition-all active:scale-95"
            >
              <span>⎋</span>
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

function CartBadge() {
  const pathname  = usePathname();
  const itemCount = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0)
  );

  if (pathname.startsWith("/pos") || itemCount === 0) return null;

  return (
    <Link
      href="/pos"
      className="relative flex items-center gap-1.5 text-sm text-indigo-100 hover:text-white transition-colors ml-2"
    >
      🛒
      <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow">
        {itemCount > 9 ? "9+" : itemCount}
      </span>
    </Link>
  );
}
