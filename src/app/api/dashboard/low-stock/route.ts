import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/dashboard/low-stock?threshold=5
// Returns all products where stock <= threshold
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const threshold = Number(searchParams.get("threshold") ?? 5);

    const products = await prisma.product.findMany({
      where: { stock: { lte: threshold } },
      orderBy: { stock: "asc" },
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        category: { select: { name: true } },
      },
    });

    return NextResponse.json(products);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to load low stock.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
