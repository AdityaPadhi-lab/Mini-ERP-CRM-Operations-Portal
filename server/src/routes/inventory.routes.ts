import { UserRole } from '@prisma/client';
import { Router } from 'express';
import * as controller from '../controllers/inventory.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

export const inventoryRouter = Router();
inventoryRouter.use(authenticate);
inventoryRouter.get('/', authorize(UserRole.ADMIN, UserRole.WAREHOUSE), controller.listMovements);
inventoryRouter.post('/', authorize(UserRole.ADMIN, UserRole.WAREHOUSE), controller.createMovement);
