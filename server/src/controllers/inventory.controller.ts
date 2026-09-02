import { MovementType } from '@prisma/client';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/api.js';
import { paginationQuery } from '../validators/common.js';
import { stockMovementSchema } from '../validators/inventory.js';
import * as inventory from '../services/inventory.service.js';

const text = (value: unknown) => typeof value === 'string' && value.trim() ? value.trim() : undefined;

export const listMovements = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = paginationQuery.parse(req.query);
  const dateValue = text(req.query.date);
  const result = await inventory.listMovements({ page, limit, productId: text(req.query.productId), movementType: z.nativeEnum(MovementType).optional().parse(req.query.movementType), date: dateValue ? z.coerce.date().parse(dateValue) : undefined });
  res.json({ success: true, ...result });
});
export const createMovement = asyncHandler(async (req: Request, res: Response) => res.status(201).json({ success: true, data: await inventory.createMovement(stockMovementSchema.parse(req.body), req.user!.id) }));
