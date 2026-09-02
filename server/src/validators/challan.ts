import { ChallanStatus } from '@prisma/client';
import { z } from 'zod';

const itemSchema = z.object({ productId: z.string().min(1), quantity: z.coerce.number().int().positive() });

export const challanSchema = z.object({
  customerId: z.string().min(1),
  status: z.nativeEnum(ChallanStatus).default(ChallanStatus.DRAFT),
  items: z.array(itemSchema).min(1).max(100).superRefine((items, ctx) => {
    const ids = new Set<string>();
    items.forEach((item, index) => {
      if (ids.has(item.productId)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'A product can only appear once in a challan.', path: [index, 'productId'] });
      ids.add(item.productId);
    });
  }),
});
