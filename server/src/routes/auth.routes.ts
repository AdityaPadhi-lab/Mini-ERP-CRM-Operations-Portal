import { Router } from 'express';
import { loginController } from '../controllers/auth.controller.js';

export const authRouter = Router();
authRouter.post('/login', loginController);
