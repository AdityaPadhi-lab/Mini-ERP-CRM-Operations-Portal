import { UserRole } from '@prisma/client';
import { Router } from 'express';
import * as controller from '../controllers/customer.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

export const customerRouter = Router();
customerRouter.use(authenticate);
customerRouter.get('/', authorize(UserRole.ADMIN, UserRole.SALES, UserRole.ACCOUNTS), controller.listCustomers);
customerRouter.get('/:id', authorize(UserRole.ADMIN, UserRole.SALES, UserRole.ACCOUNTS), controller.getCustomer);
customerRouter.post('/', authorize(UserRole.ADMIN, UserRole.SALES), controller.createCustomer);
customerRouter.put('/:id', authorize(UserRole.ADMIN, UserRole.SALES), controller.updateCustomer);
customerRouter.delete('/:id', authorize(UserRole.ADMIN), controller.deleteCustomer);
customerRouter.get('/:id/followups', authorize(UserRole.ADMIN, UserRole.SALES, UserRole.ACCOUNTS), controller.listFollowUps);
customerRouter.post('/:id/followups', authorize(UserRole.ADMIN, UserRole.SALES), controller.createFollowUp);
