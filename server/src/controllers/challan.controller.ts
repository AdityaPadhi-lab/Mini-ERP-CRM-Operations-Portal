import { ChallanStatus } from '@prisma/client';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/api.js';
import { idParam, paginationQuery } from '../validators/common.js';
import { challanSchema } from '../validators/challan.js';
import * as challans from '../services/challan.service.js';

const text = (value: unknown) => typeof value === 'string' && value.trim() ? value.trim() : undefined;

export const listChallans = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = paginationQuery.parse(req.query);
  const result = await challans.listChallans({ page, limit, status: z.nativeEnum(ChallanStatus).optional().parse(req.query.status), search: text(req.query.search), customerId: text(req.query.customerId) });
  res.json({ success: true, ...result });
});
export const getChallan = asyncHandler(async (req: Request, res: Response) => res.json({ success: true, data: await challans.getChallan(idParam.parse(req.params).id) }));
export const createChallan = asyncHandler(async (req: Request, res: Response) => res.status(201).json({ success: true, data: await challans.createChallan(challanSchema.parse(req.body), req.user!.id) }));
export const updateChallan = asyncHandler(async (req: Request, res: Response) => res.json({ success: true, data: await challans.updateChallan(idParam.parse(req.params).id, challanSchema.parse(req.body)) }));
export const confirmChallan = asyncHandler(async (req: Request, res: Response) => res.json({ success: true, data: await challans.confirmChallan(idParam.parse(req.params).id, req.user!.id) }));
export const cancelChallan = asyncHandler(async (req: Request, res: Response) => res.json({ success: true, data: await challans.cancelChallan(idParam.parse(req.params).id, req.user!.id) }));
