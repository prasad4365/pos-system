import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/products – list all products with category
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: "asc" },
      include: { category: true },
    });
    return NextResponse.json(products);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch products." },
      { status: 500 }
    );
  }
}

// POST /api/products – create a product
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, sku, barcode, price, costPrice, stock, categoryId } = body;

    if (!name || !sku || price == null || costPrice == null || !categoryId) {
      return NextResponse.json(
        { error: "name, sku, price, costPrice and categoryId are required." },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        sku: sku.trim(),
        barcode: barcode?.trim() || null,
        price: Number(price),
        costPrice: Number(costPrice),
        stock: Number(stock ?? 0),
        categoryId,
      },
      include: { category: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to create product.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
