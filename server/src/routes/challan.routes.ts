import { UserRole } from '@prisma/client';
import { Router } from 'express';
import * as controller from '../controllers/challan.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

export const challanRouter = Router();
challanRouter.use(authenticate);
challanRouter.get('/', authorize(UserRole.ADMIN, UserRole.SALES, UserRole.WAREHOUSE, UserRole.ACCOUNTS), controller.listChallans);
challanRouter.get('/:id', authorize(UserRole.ADMIN, UserRole.SALES, UserRole.WAREHOUSE, UserRole.ACCOUNTS), controller.getChallan);
challanRouter.post('/', authorize(UserRole.ADMIN, UserRole.SALES), controller.createChallan);
challanRouter.put('/:id', authorize(UserRole.ADMIN, UserRole.SALES), controller.updateChallan);
challanRouter.post('/:id/confirm', authorize(UserRole.ADMIN, UserRole.SALES), controller.confirmChallan);
challanRouter.post('/:id/cancel', authorize(UserRole.ADMIN, UserRole.SALES), controller.cancelChallan);
