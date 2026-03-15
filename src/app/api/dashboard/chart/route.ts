import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/dashboard/chart?days=7
// Returns daily revenue aggregated for the last N days
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const days = Math.min(Number(searchParams.get("days") ?? 7), 90);

    const results: { date: string; revenue: number; orders: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      const orders = await prisma.order.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { payableAmount: true },
      });

      const revenue = orders.reduce((sum, o) => sum + o.payableAmount, 0);

      results.push({
        date: start.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: parseFloat(revenue.toFixed(2)),
        orders: orders.length,
      });
    }

    return NextResponse.json(results);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to load chart data.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
