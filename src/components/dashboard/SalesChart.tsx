"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ChartPoint {
  date: string;
  revenue: number;
  orders: number;
}

interface SalesChartProps {
  days?: number;
}

export default function SalesChart({ days = 7 }: SalesChartProps) {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dashboard/chart?days=${days}`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setData(d);
        else setError("Failed to load chart data.");
      })
      .catch(() => setError("Network error."))
      .finally(() => setLoading(false));
  }, [days]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground text-sm animate-pulse">
        Loading chart…
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center text-red-500 text-sm">
        {error}
      </div>
    );
  }

  const hasData = data.some((d) => d.revenue > 0);

  if (!hasData) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
        No sales data for this period.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          yAxisId="revenue"
          tick={{ fontSize: 12, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v}`}
        />
        <YAxis
          yAxisId="orders"
          orientation="right"
          tick={{ fontSize: 12, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            fontSize: "13px",
          }}
          formatter={(value, name) => {
            const v = Number(value ?? 0);
            return name === "revenue"
              ? [`$${v.toFixed(2)}`, "Revenue"]
              : [v, "Orders"];
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
          formatter={(value) => (value === "revenue" ? "Revenue ($)" : "Orders")}
        />
        <Bar
          yAxisId="revenue"
          dataKey="revenue"
          name="revenue"
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          yAxisId="orders"
          dataKey="orders"
          name="orders"
          fill="#10b981"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
