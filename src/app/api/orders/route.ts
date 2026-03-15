import { prisma } from "@/lib/prisma";
import { decrementStockForOrder } from "@/lib/stock";
import { NextResponse } from "next/server";

// POST /api/orders – place a new order (checkout)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, totalAmount, payableAmount, paymentMethod } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Order must contain at least one item." },
        { status: 400 }
      );
    }

    // Use a placeholder userId for now (until auth is implemented)
    // In Phase 4, replace with session user id
    let defaultUser = await prisma.user.findFirst();
    if (!defaultUser) {
      defaultUser = await prisma.user.create({
        data: {
          name: "Default Cashier",
          email: "cashier@pos.local",
          password: "changeme",
          role: "CASHIER",
        },
      });
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}`;

    // Decrement stock atomically — throws on insufficient stock
    await decrementStockForOrder(
      items.map((i: { productId: string; quantity: number }) => ({
        productId: i.productId,
        quantity: i.quantity,
      }))
    );

    // Create the order record
    const order = await prisma.order.create({
      data: {
        orderNumber,
        totalAmount: Number(totalAmount),
        payableAmount: Number(payableAmount),
        paymentMethod: paymentMethod ?? "CASH",
        userId: defaultUser.id,
        items: {
          create: items.map(
            (i: { productId: string; quantity: number; unitPrice: number }) => ({
              productId: i.productId,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
            })
          ),
        },
      },
      include: {
        items: { include: { product: { select: { name: true, sku: true } } } },
        user: { select: { name: true } },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to place order.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// GET /api/orders – list all orders
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { product: true } },
        user: { select: { name: true } },
      },
    });
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch orders." },
      { status: 500 }
    );
  }
}
