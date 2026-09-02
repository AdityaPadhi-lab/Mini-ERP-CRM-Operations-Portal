import type { CustomerStatus, CustomerType, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { ApiError, paginated } from '../utils/api.js';
import type { z } from 'zod';
import type { customerSchema, followUpSchema } from '../validators/customer.js';

type CustomerInput = z.infer<typeof customerSchema>;
type FollowUpInput = z.infer<typeof followUpSchema>;

const customerInclude = { createdBy: { select: { id: true, name: true, role: true } } } as const;

export async function listCustomers(input: { page: number; limit: number; search?: string; status?: CustomerStatus; customerType?: CustomerType }) {
  const where: Prisma.CustomerWhereInput = {
    ...(input.status ? { status: input.status } : {}),
    ...(input.customerType ? { customerType: input.customerType } : {}),
    ...(input.search ? { OR: [
      { customerName: { contains: input.search, mode: 'insensitive' } },
      { businessName: { contains: input.search, mode: 'insensitive' } },
      { mobileNumber: { contains: input.search, mode: 'insensitive' } },
      { email: { contains: input.search, mode: 'insensitive' } },
    ] } : {}),
  };
  const [data, total] = await prisma.$transaction([
    prisma.customer.findMany({ where, include: customerInclude, orderBy: { createdAt: 'desc' }, skip: (input.page - 1) * input.limit, take: input.limit }),
    prisma.customer.count({ where }),
  ]);
  return { data, pagination: paginated(input.page, input.limit, total) };
}

export async function getCustomer(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { ...customerInclude, followUps: { include: { createdBy: { select: { id: true, name: true, role: true } } }, orderBy: { createdAt: 'desc' } }, _count: { select: { challans: true } } },
  });
  if (!customer) throw new ApiError(404, 'Customer not found.');
  return customer;
}

export function createCustomer(input: CustomerInput, createdById: string) {
  return prisma.customer.create({ data: { ...input, createdById }, include: customerInclude });
}

export async function updateCustomer(id: string, input: CustomerInput) {
  await getCustomer(id);
  return prisma.customer.update({ where: { id }, data: input, include: customerInclude });
}

export async function deleteCustomer(id: string) {
  const customer = await prisma.customer.findUnique({ where: { id }, include: { _count: { select: { challans: true } } } });
  if (!customer) throw new ApiError(404, 'Customer not found.');
  if (customer._count.challans) throw new ApiError(400, 'Customers with sales challans cannot be deleted. Mark the customer inactive instead.');
  await prisma.customer.delete({ where: { id } });
}

export async function listFollowUps(customerId: string) {
  await getCustomer(customerId);
  return prisma.customerFollowUp.findMany({ where: { customerId }, include: { createdBy: { select: { id: true, name: true, role: true } } }, orderBy: { createdAt: 'desc' } });
}

export async function createFollowUp(customerId: string, input: FollowUpInput, createdById: string) {
  await getCustomer(customerId);
  return prisma.$transaction(async (tx) => {
    const followUp = await tx.customerFollowUp.create({ data: { ...input, customerId, createdById }, include: { createdBy: { select: { id: true, name: true, role: true } } } });
    await tx.customer.update({ where: { id: customerId }, data: { followUpDate: input.followUpDate } });
    return followUp;
  });
}
