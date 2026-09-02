import { UserRole } from '@prisma/client';
import { Router } from 'express';
import * as controller from '../controllers/product.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

export const productRouter = Router();
productRouter.use(authenticate);
productRouter.get('/meta/categories', authorize(UserRole.ADMIN, UserRole.SALES, UserRole.WAREHOUSE, UserRole.ACCOUNTS), controller.listCategories);
productRouter.get('/', authorize(UserRole.ADMIN, UserRole.SALES, UserRole.WAREHOUSE, UserRole.ACCOUNTS), controller.listProducts);
productRouter.get('/:id', authorize(UserRole.ADMIN, UserRole.SALES, UserRole.WAREHOUSE, UserRole.ACCOUNTS), controller.getProduct);
productRouter.post('/', authorize(UserRole.ADMIN, UserRole.WAREHOUSE), controller.createProduct);
productRouter.put('/:id', authorize(UserRole.ADMIN, UserRole.WAREHOUSE), controller.updateProduct);
