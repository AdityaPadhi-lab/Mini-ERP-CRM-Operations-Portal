import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { ApiError, asyncHandler } from '../utils/api.js';

type TokenPayload = { sub: string };

export const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) throw new ApiError(401, 'Authorization token is required.');

  try {
    const payload = jwt.verify(header.slice(7), env.jwtSecret) as TokenPayload;
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new ApiError(401, 'Your session is no longer valid.');
    req.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    next();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, 'Your session has expired or the token is invalid.');
  }
});

export const authorize = (...roles: UserRole[]) => (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) return next(new ApiError(401, 'Authentication is required.'));
  if (!roles.includes(req.user.role)) return next(new ApiError(403, 'You do not have permission to perform this action.'));
  next();
};
