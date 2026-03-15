import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/dashboard/stats
// Returns: today's revenue, order count, units sold, and all-time totals
export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0, 0, 0, 0
    );
    const todayEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23, 59, 59, 999
    );

    // Fetch today's orders
    const todayOrders = await prisma.order.findMany({
      where: { createdAt: { gte: todayStart, lte: todayEnd } },
      include: { items: true },
    });

    const todayRevenue = todayOrders.reduce(
      (sum, o) => sum + o.payableAmount, 0
    );
    const todayOrderCount = todayOrders.length;
    const todayUnitsSold = todayOrders.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
      0
    );

    // All-time totals
    const allOrders = await prisma.order.findMany({
      include: { items: true },
    });
    const totalRevenue = allOrders.reduce(
      (sum, o) => sum + o.payableAmount, 0
    );
    const totalOrders = allOrders.length;
    const totalUnitsSold = allOrders.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
      0
    );

    // Product count
    const productCount = await prisma.product.count();
    const lowStockCount = await prisma.product.count({
      where: { stock: { lte: 5 } },
    });

    return NextResponse.json({
      today: {
        revenue: parseFloat(todayRevenue.toFixed(2)),
        orders: todayOrderCount,
        unitsSold: todayUnitsSold,
      },
      allTime: {
        revenue: parseFloat(totalRevenue.toFixed(2)),
        orders: totalOrders,
        unitsSold: totalUnitsSold,
      },
      inventory: {
        productCount,
        lowStockCount,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to load stats.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
