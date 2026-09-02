import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { ApiError, paginated } from '../utils/api.js';
import type { z } from 'zod';
import type { stockMovementSchema } from '../validators/inventory.js';

type StockMovementInput = z.infer<typeof stockMovementSchema>;

export async function listMovements(input: { page: number; limit: number; productId?: string; movementType?: 'IN' | 'OUT'; date?: Date }) {
  const where: Prisma.StockMovementWhereInput = {
    ...(input.productId ? { productId: input.productId } : {}),
    ...(input.movementType ? { movementType: input.movementType } : {}),
    ...(input.date ? { createdAt: { gte: new Date(input.date.setHours(0, 0, 0, 0)), lte: new Date(input.date.setHours(23, 59, 59, 999)) } } : {}),
  };
  const [data, total] = await prisma.$transaction([
    prisma.stockMovement.findMany({ where, include: { product: { select: { id: true, productName: true, sku: true } }, createdBy: { select: { id: true, name: true, role: true } } }, orderBy: { createdAt: 'desc' }, skip: (input.page - 1) * input.limit, take: input.limit }),
    prisma.stockMovement.count({ where }),
  ]);
  return { data, pagination: paginated(input.page, input.limit, total) };
}

export async function createMovement(input: StockMovementInput, createdById: string) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: input.productId } });
    if (!product) throw new ApiError(404, 'Product not found.');
    if (input.movementType === 'OUT') {
      const updated = await tx.product.updateMany({ where: { id: product.id, currentStock: { gte: input.quantity } }, data: { currentStock: { decrement: input.quantity } } });
      if (!updated.count) throw new ApiError(400, `Stock unavailable. ${product.productName} has only ${product.currentStock} units available.`);
    } else {
      await tx.product.update({ where: { id: product.id }, data: { currentStock: { increment: input.quantity } } });
    }
    return tx.stockMovement.create({ data: { ...input, createdById }, include: { product: { select: { id: true, productName: true, sku: true } }, createdBy: { select: { id: true, name: true, role: true } } } });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
