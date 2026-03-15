import { prisma } from "@/lib/prisma";

/**
 * Increment stock for a product (e.g. receiving new inventory).
 * @param productId - The id of the product to restock.
 * @param quantity  - The number of units to add.
 */
export async function incrementStock(
  productId: string,
  quantity: number
): Promise<void> {
  if (quantity <= 0) throw new Error("Quantity must be a positive number.");

  await prisma.product.update({
    where: { id: productId },
    data: { stock: { increment: quantity } },
  });
}

/**
 * Decrement stock for multiple products within a single transaction.
 * Used when a sale/order is confirmed.
 * @param items - Array of { productId, quantity } pairs representing sold items.
 */
export async function decrementStockForOrder(
  items: { productId: string; quantity: number }[]
): Promise<void> {
  if (items.length === 0) return;

  await prisma.$transaction(async (tx) => {
    for (const item of items) {
      // Fetch current stock and lock the row
      const product = await tx.product.findUnique({
        where: { id: item.productId },
        select: { id: true, stock: true, name: true },
      });

      if (!product) {
        throw new Error(`Product ${item.productId} not found.`);
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}.`
        );
      }

      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }
  });
}
