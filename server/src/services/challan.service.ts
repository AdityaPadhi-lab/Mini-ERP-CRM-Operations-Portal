import { ChallanStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { ApiError, paginated } from '../utils/api.js';
import type { z } from 'zod';
import type { challanSchema } from '../validators/challan.js';

type ChallanInput = z.infer<typeof challanSchema>;
const detailInclude = {
  customer: true,
  createdBy: { select: { id: true, name: true, role: true } },
  items: { include: { product: { select: { id: true, productName: true, sku: true, currentStock: true, warehouseLocation: true } } } },
} as const;

async function getSnapshotItems(tx: Prisma.TransactionClient, input: ChallanInput) {
  const products = await tx.product.findMany({ where: { id: { in: input.items.map((item) => item.productId) } } });
  if (products.length !== input.items.length) throw new ApiError(400, 'One or more selected products no longer exist.');
  const lookup = new Map(products.map((product) => [product.id, product]));
  return input.items.map((item) => {
    const product = lookup.get(item.productId)!;
    return { productId: product.id, quantity: item.quantity, productNameSnapshot: product.productName, skuSnapshot: product.sku, unitPriceSnapshot: product.unitPrice };
  });
}

async function nextChallanNumber(tx: Prisma.TransactionClient) {
  const year = new Date().getFullYear();
  const prefix = `CH-${year}-`;
  const last = await tx.salesChallan.findFirst({ where: { challanNumber: { startsWith: prefix } }, select: { challanNumber: true }, orderBy: { challanNumber: 'desc' } });
  const sequence = last ? Number(last.challanNumber.slice(prefix.length)) + 1 : 1;
  return `${prefix}${String(sequence).padStart(6, '0')}`;
}

export async function listChallans(input: { page: number; limit: number; status?: ChallanStatus; search?: string; customerId?: string }) {
  const where: Prisma.SalesChallanWhereInput = {
    ...(input.status ? { status: input.status } : {}),
    ...(input.customerId ? { customerId: input.customerId } : {}),
    ...(input.search ? { OR: [
      { challanNumber: { contains: input.search, mode: 'insensitive' } },
      { customer: { customerName: { contains: input.search, mode: 'insensitive' } } },
      { customer: { businessName: { contains: input.search, mode: 'insensitive' } } },
    ] } : {}),
  };
  const [data, total] = await prisma.$transaction([
    prisma.salesChallan.findMany({ where, include: { customer: { select: { id: true, customerName: true, businessName: true } }, createdBy: { select: { id: true, name: true, role: true } }, _count: { select: { items: true } } }, orderBy: { createdAt: 'desc' }, skip: (input.page - 1) * input.limit, take: input.limit }),
    prisma.salesChallan.count({ where }),
  ]);
  return { data, pagination: paginated(input.page, input.limit, total) };
}

export async function getChallan(id: string) {
  const challan = await prisma.salesChallan.findUnique({ where: { id }, include: detailInclude });
  if (!challan) throw new ApiError(404, 'Sales challan not found.');
  return challan;
}

export async function createChallan(input: ChallanInput, createdById: string) {
  if (input.status !== ChallanStatus.DRAFT) throw new ApiError(400, 'New challans must be saved as a draft before confirmation.');
  return prisma.$transaction(async (tx) => {
    const customer = await tx.customer.findUnique({ where: { id: input.customerId } });
    if (!customer) throw new ApiError(400, 'The selected customer does not exist.');
    const items = await getSnapshotItems(tx, input);
    return tx.salesChallan.create({
      data: { challanNumber: await nextChallanNumber(tx), customerId: input.customerId, status: ChallanStatus.DRAFT, totalQuantity: input.items.reduce((sum, item) => sum + item.quantity, 0), createdById, items: { create: items } },
      include: detailInclude,
    });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function updateChallan(id: string, input: ChallanInput) {
  const existing = await getChallan(id);
  if (existing.status !== ChallanStatus.DRAFT) throw new ApiError(400, 'Only draft challans can be edited.');
  return prisma.$transaction(async (tx) => {
    const customer = await tx.customer.findUnique({ where: { id: input.customerId } });
    if (!customer) throw new ApiError(400, 'The selected customer does not exist.');
    const items = await getSnapshotItems(tx, input);
    await tx.salesChallanItem.deleteMany({ where: { challanId: id } });
    return tx.salesChallan.update({
      where: { id },
      data: { customerId: input.customerId, totalQuantity: input.items.reduce((sum, item) => sum + item.quantity, 0), items: { create: items } },
      include: detailInclude,
    });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function confirmChallan(id: string, userId: string) {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.$transaction(async (tx) => {
        const challan = await tx.salesChallan.findUnique({ where: { id }, include: { items: { include: { product: true } } } });
        if (!challan) throw new ApiError(404, 'Sales challan not found.');
        if (challan.status !== ChallanStatus.DRAFT) throw new ApiError(400, 'Only draft challans can be confirmed.');
        for (const item of challan.items) {
          const updated = await tx.product.updateMany({ where: { id: item.productId, currentStock: { gte: item.quantity } }, data: { currentStock: { decrement: item.quantity } } });
          if (!updated.count) {
            const product = await tx.product.findUnique({ where: { id: item.productId }, select: { productName: true, currentStock: true } });
            throw new ApiError(400, `Insufficient stock for ${product?.productName ?? item.productNameSnapshot}. Available: ${product?.currentStock ?? 0}, requested: ${item.quantity}.`);
          }
        }
        await tx.stockMovement.createMany({ data: challan.items.map((item) => ({ productId: item.productId, quantity: item.quantity, movementType: 'OUT', reason: `Confirmed sales challan ${challan.challanNumber}`, createdById: userId })) });
        return tx.salesChallan.update({ where: { id }, data: { status: ChallanStatus.CONFIRMED, confirmedAt: new Date() }, include: detailInclude });
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      lastError = error;
      if ((error as { code?: string }).code !== 'P2034') throw error;
    }
  }
  throw new ApiError(409, `Unable to confirm challan due to concurrent inventory activity. Please try again. ${(lastError as Error)?.message ?? ''}`.trim());
}

export async function cancelChallan(id: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const challan = await tx.salesChallan.findUnique({ where: { id }, include: { items: true } });
    if (!challan) throw new ApiError(404, 'Sales challan not found.');
    if (challan.status === ChallanStatus.CANCELLED) throw new ApiError(400, 'This challan is already cancelled.');
    if (challan.status === ChallanStatus.CONFIRMED) {
      for (const item of challan.items) await tx.product.update({ where: { id: item.productId }, data: { currentStock: { increment: item.quantity } } });
      await tx.stockMovement.createMany({ data: challan.items.map((item) => ({ productId: item.productId, quantity: item.quantity, movementType: 'IN', reason: `Cancelled sales challan ${challan.challanNumber}`, createdById: userId })) });
    }
    return tx.salesChallan.update({ where: { id }, data: { status: ChallanStatus.CANCELLED }, include: detailInclude });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
