import { CustomerStatus, CustomerType } from '@prisma/client';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/api.js';
import { idParam, paginationQuery } from '../validators/common.js';
import { customerSchema, followUpSchema } from '../validators/customer.js';
import * as customers from '../services/customer.service.js';

const textQuery = (value: unknown) => typeof value === 'string' && value.trim() ? value.trim() : undefined;

export const listCustomers = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = paginationQuery.parse(req.query);
  const result = await customers.listCustomers({ page, limit, search: textQuery(req.query.search), status: z.nativeEnum(CustomerStatus).optional().parse(req.query.status), customerType: z.nativeEnum(CustomerType).optional().parse(req.query.customerType) });
  res.json({ success: true, ...result });
});
export const getCustomer = asyncHandler(async (req: Request, res: Response) => res.json({ success: true, data: await customers.getCustomer(idParam.parse(req.params).id) }));
export const createCustomer = asyncHandler(async (req: Request, res: Response) => res.status(201).json({ success: true, data: await customers.createCustomer(customerSchema.parse(req.body), req.user!.id) }));
export const updateCustomer = asyncHandler(async (req: Request, res: Response) => res.json({ success: true, data: await customers.updateCustomer(idParam.parse(req.params).id, customerSchema.parse(req.body)) }));
export const deleteCustomer = asyncHandler(async (req: Request, res: Response) => { await customers.deleteCustomer(idParam.parse(req.params).id); res.status(204).send(); });
export const listFollowUps = asyncHandler(async (req: Request, res: Response) => res.json({ success: true, data: await customers.listFollowUps(idParam.parse(req.params).id) }));
export const createFollowUp = asyncHandler(async (req: Request, res: Response) => res.status(201).json({ success: true, data: await customers.createFollowUp(idParam.parse(req.params).id, followUpSchema.parse(req.body), req.user!.id) }));
