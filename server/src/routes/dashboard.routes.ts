import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { getDashboard } from '../controllers/dashboard.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

export const dashboardRouter = Router();
dashboardRouter.get('/stats', authenticate, authorize(UserRole.ADMIN, UserRole.SALES, UserRole.WAREHOUSE, UserRole.ACCOUNTS), getDashboard);
