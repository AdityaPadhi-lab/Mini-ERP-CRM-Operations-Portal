import type { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { ApiError, paginated } from '../utils/api.js';
import type { z } from 'zod';
import type { productSchema } from '../validators/product.js';

type ProductInput = z.infer<typeof productSchema>;

export async function listProducts(input: { page: number; limit: number; search?: string; category?: string; lowStock?: boolean }) {
  const where: Prisma.ProductWhereInput = {
    ...(input.category ? { category: { equals: input.category, mode: 'insensitive' } } : {}),
    ...(input.search ? { OR: [{ productName: { contains: input.search, mode: 'insensitive' } }, { sku: { contains: input.search, mode: 'insensitive' } }] } : {}),
    ...(input.lowStock ? { currentStock: { lte: prisma.product.fields.minimumStockQuantity } } : {}),
  };
  // Prisma filters cannot compare two fields. Low-stock products are filtered in the database result set below.
  if (input.lowStock) delete where.currentStock;
  const [records, total] = await prisma.$transaction([
    prisma.product.findMany({ where, orderBy: { createdAt: 'desc' }, skip: input.lowStock ? 0 : (input.page - 1) * input.limit, take: input.lowStock ? undefined : input.limit }),
    prisma.product.count({ where }),
  ]);
  const data = input.lowStock ? records.filter((product) => product.currentStock <= product.minimumStockQuantity).slice((input.page - 1) * input.limit, input.page * input.limit) : records;
  const filteredTotal = input.lowStock ? records.filter((product) => product.currentStock <= product.minimumStockQuantity).length : total;
  return { data, pagination: paginated(input.page, input.limit, filteredTotal) };
}

export async function getProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new ApiError(404, 'Product not found.');
  return product;
}

export async function createProduct(input: ProductInput, createdById: string) {
  try {
    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({ data: input });
      if (input.currentStock > 0) await tx.stockMovement.create({ data: { productId: product.id, quantity: input.currentStock, movementType: 'IN', reason: 'Initial opening balance', createdById } });
      return product;
    });
  } catch (error) {
    if ((error as { code?: string }).code === 'P2002') throw new ApiError(409, 'A product with this SKU already exists.');
    throw error;
  }
}

export async function updateProduct(id: string, input: ProductInput) {
  const existing = await getProduct(id);
  if (input.currentStock !== existing.currentStock) throw new ApiError(400, 'Use stock movements to change inventory quantities.');
  try {
    return await prisma.product.update({ where: { id }, data: input });
  } catch (error) {
    if ((error as { code?: string }).code === 'P2002') throw new ApiError(409, 'A product with this SKU already exists.');
    throw error;
  }
}

export function productCategories() {
  return prisma.product.findMany({ select: { category: true }, distinct: ['category'], orderBy: { category: 'asc' } });
}
