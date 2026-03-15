"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import SalesChart from "@/components/dashboard/SalesChart";
import LowStockTable from "@/components/dashboard/LowStockTable";
import type { SessionUser } from "@/lib/auth";

interface Stats {
  today: { revenue: number; orders: number; unitsSold: number };
  allTime: { revenue: number; orders: number; unitsSold: number };
  inventory: { productCount: number; lowStockCount: number };
}

const CHART_OPTIONS = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 14 days", value: 14 },
  { label: "Last 30 days", value: 30 },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [chartDays, setChartDays] = useState(7);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then(setCurrentUser)
      .catch(() => null);
  }, []);

  const isAdmin = currentUser?.role === "ADMIN";

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((d) => !d.error && setStats(d))
      .catch(console.error)
      .finally(() => setStatsLoading(false));
  }, []);

  const today = stats?.today;
  const allTime = stats?.allTime;
  const inventory = stats?.inventory;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="pb-2 border-b border-slate-200">
        <h1
          className="text-3xl font-extrabold text-slate-800 tracking-tight"
          style={{ fontFamily: "var(--font-jakarta)" }}
        >
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* ── Today's Stats ── */}
      <section>
        <h2
          className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4"
          style={{ fontFamily: "var(--font-jakarta)" }}
        >
          Today
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border bg-white p-5 flex flex-col gap-3 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="h-3 w-24 rounded bg-slate-200 animate-pulse" />
                  <div className="w-10 h-10 rounded-xl bg-slate-200 animate-pulse" />
                </div>
                <div className="h-8 w-20 rounded bg-slate-200 animate-pulse" />
                <div className="h-2.5 w-32 rounded bg-slate-100 animate-pulse" />
              </div>
            ))
          ) : (
            <>
              <StatCard
                title="Today's Revenue"
                value={`$${today?.revenue.toFixed(2) ?? "0.00"}`}
                sub="Payable amount collected"
                icon="💰"
                accent="green"
              />
              <StatCard
                title="Orders Today"
                value={today?.orders ?? 0}
                sub="Completed transactions"
                icon="🧾"
                accent="blue"
              />
              <StatCard
                title="Units Sold Today"
                value={today?.unitsSold ?? 0}
                sub="Total items sold"
                icon="📦"
                accent="default"
              />
              <StatCard
                title="Low Stock Items"
                value={inventory?.lowStockCount ?? 0}
                sub="Products with ≤ 5 units"
                icon="⚠️"
                accent={inventory?.lowStockCount ? "red" : "default"}
              />
            </>
          )}
        </div>
      </section>

      {/* ── All-time Stats (Admin only) ── */}
      {isAdmin && (
      <section>
        <h2
          className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4"
          style={{ fontFamily: "var(--font-jakarta)" }}
        >
          All Time
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {statsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border bg-white p-5 flex flex-col gap-3 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="h-3 w-24 rounded bg-slate-200 animate-pulse" />
                  <div className="w-10 h-10 rounded-xl bg-slate-200 animate-pulse" />
                </div>
                <div className="h-8 w-20 rounded bg-slate-200 animate-pulse" />
                <div className="h-2.5 w-32 rounded bg-slate-100 animate-pulse" />
              </div>
            ))
          ) : (
            <>
              <StatCard
                title="Total Revenue"
                value={`$${allTime?.revenue.toFixed(2) ?? "0.00"}`}
                sub="All orders combined"
                icon="📈"
                accent="green"
              />
              <StatCard
                title="Total Orders"
                value={allTime?.orders ?? 0}
                sub="Since system launch"
                icon="🗂️"
                accent="blue"
              />
              <StatCard
                title="Products in Catalogue"
                value={inventory?.productCount ?? 0}
                sub="Active products"
                icon="🏷️"
                accent="default"
              />
            </>
          )}
        </div>
      </section>
      )}

      {/* ── Sales Chart ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-xs font-bold text-muted-foreground uppercase tracking-widest"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            Daily Revenue Trend
          </h2>
          <div className="flex gap-1">
            {CHART_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setChartDays(opt.value)}
                className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${
                  chartDays === opt.value
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-white text-muted-foreground border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border shadow-sm p-4">
          <SalesChart days={chartDays} />
        </div>
      </section>

      {/* ── Low Stock Alerts ── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <h2
            className="text-xs font-bold text-muted-foreground uppercase tracking-widest"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            Low Stock Alerts
          </h2>
          {inventory?.lowStockCount ? (
            <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-semibold">
              {inventory.lowStockCount} item{inventory.lowStockCount !== 1 ? "s" : ""}
            </span>
          ) : null}
        </div>
        <div className="bg-white rounded-2xl border shadow-sm p-4">
          <LowStockTable />
        </div>
      </section>
    </div>
  );
}
