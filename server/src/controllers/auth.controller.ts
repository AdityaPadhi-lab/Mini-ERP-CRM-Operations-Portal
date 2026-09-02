import type { Request, Response } from 'express';
import { loginSchema } from '../validators/auth.js';
import { asyncHandler } from '../utils/api.js';
import { login } from '../services/auth.service.js';

export const loginController = asyncHandler(async (req: Request, res: Response) => {
  const input = loginSchema.parse(req.body);
  res.json({ success: true, data: await login(input.email, input.password) });
});
