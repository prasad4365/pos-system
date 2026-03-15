import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { incrementStock } from "@/lib/stock";

// GET /api/products/[id]
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!product)
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  return NextResponse.json(product);
}

// PUT /api/products/[id] – update product details or restock via ?action=restock
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  try {
    if (action === "restock") {
      // Only increment stock: { quantity: number }
      const { quantity } = await req.json();
      if (!quantity || Number(quantity) <= 0) {
        return NextResponse.json(
          { error: "quantity must be a positive number." },
          { status: 400 }
        );
      }
      await incrementStock(id, Number(quantity));
      const updated = await prisma.product.findUnique({ where: { id } });
      return NextResponse.json(updated);
    }

    // Full update
    const body = await req.json();
    const { name, sku, barcode, price, costPrice, stock, categoryId } = body;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(sku && { sku: sku.trim() }),
        ...(barcode !== undefined && { barcode: barcode?.trim() || null }),
        ...(price != null && { price: Number(price) }),
        ...(costPrice != null && { costPrice: Number(costPrice) }),
        ...(stock != null && { stock: Number(stock) }),
        ...(categoryId && { categoryId }),
      },
      include: { category: true },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Failed to update product." },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ message: "Product deleted." });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete product." },
      { status: 500 }
    );
  }
}
