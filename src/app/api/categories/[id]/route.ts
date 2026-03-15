import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/categories/[id]
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
    include: { products: true },
  });
  if (!category)
    return NextResponse.json({ error: "Category not found." }, { status: 404 });
  return NextResponse.json(category);
}

// PUT /api/categories/[id]
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { name } = await req.json();
    if (!name?.trim())
      return NextResponse.json(
        { error: "Category name is required." },
        { status: 400 }
      );

    const updated = await prisma.category.update({
      where: { id },
      data: { name: name.trim() },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Failed to update category." },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ message: "Category deleted." });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete category. It may have associated products." },
      { status: 500 }
    );
  }
}
