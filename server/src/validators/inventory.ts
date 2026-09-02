import { MovementType } from '@prisma/client';
import { z } from 'zod';

export const stockMovementSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
  movementType: z.nativeEnum(MovementType),
  reason: z.string().trim().min(2).max(300),
});
