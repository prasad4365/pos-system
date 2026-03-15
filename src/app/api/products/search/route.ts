import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/products/search?q=<query>
// Searches products by name (contains) or exact barcode match
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required." },
      { status: 400 }
    );
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { barcode: q }, // exact barcode match for scanner
          { sku: { contains: q } },
        ],
      },
      include: { category: true },
      take: 20,
      orderBy: { name: "asc" },
    });

    return NextResponse.json(products);
  } catch {
    return NextResponse.json(
      { error: "Search failed." },
      { status: 500 }
    );
  }
}
