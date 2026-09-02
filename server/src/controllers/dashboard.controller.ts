import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/api.js';
import { dashboardStats } from '../services/dashboard.service.js';

export const getDashboard = asyncHandler(async (_req: Request, res: Response) => res.json({ success: true, data: await dashboardStats() }));
