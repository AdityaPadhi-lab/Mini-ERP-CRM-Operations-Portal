import type { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/api.js';
import { idParam, paginationQuery } from '../validators/common.js';
import { productSchema } from '../validators/product.js';
import * as products from '../services/product.service.js';

const bool = (value: unknown) => z.enum(['true', 'false']).optional().transform((item) => item === 'true').parse(value);
const text = (value: unknown) => typeof value === 'string' && value.trim() ? value.trim() : undefined;

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = paginationQuery.parse(req.query);
  const result = await products.listProducts({ page, limit, search: text(req.query.search), category: text(req.query.category), lowStock: bool(req.query.lowStock) });
  res.json({ success: true, ...result });
});
export const getProduct = asyncHandler(async (req: Request, res: Response) => res.json({ success: true, data: await products.getProduct(idParam.parse(req.params).id) }));
export const createProduct = asyncHandler(async (req: Request, res: Response) => res.status(201).json({ success: true, data: await products.createProduct(productSchema.parse(req.body), req.user!.id) }));
export const updateProduct = asyncHandler(async (req: Request, res: Response) => res.json({ success: true, data: await products.updateProduct(idParam.parse(req.params).id, productSchema.parse(req.body)) }));
export const listCategories = asyncHandler(async (_req: Request, res: Response) => res.json({ success: true, data: await products.productCategories() }));
