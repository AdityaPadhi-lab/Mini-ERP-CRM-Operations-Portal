import { CustomerStatus, CustomerType } from '@prisma/client';
import { z } from 'zod';

export const customerSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  mobileNumber: z.string().trim().min(7).max(20),
  email: z.string().email(),
  businessName: z.string().trim().min(2).max(160),
  gstNumber: z.string().trim().max(30).optional().nullable(),
  customerType: z.nativeEnum(CustomerType),
  address: z.string().trim().min(5).max(500),
  status: z.nativeEnum(CustomerStatus).default(CustomerStatus.LEAD),
  followUpDate: z.coerce.date().optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

export const followUpSchema = z.object({
  note: z.string().trim().min(2).max(2000),
  followUpDate: z.coerce.date(),
});
