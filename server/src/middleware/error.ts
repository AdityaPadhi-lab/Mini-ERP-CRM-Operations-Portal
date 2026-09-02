import type { ErrorRequestHandler, RequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { isProduction } from '../config/env.js';
import { ApiError } from '../utils/api.js';

export const notFound: RequestHandler = (req, _res, next) => next(new ApiError(404, `Route ${req.method} ${req.path} was not found.`));

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(400).json({ success: false, message: 'Validation failed.', errors: error.flatten() });
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') return res.status(409).json({ success: false, message: 'A record with that unique value already exists.' });
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'The requested record was not found.' });
  }
  if (error instanceof ApiError) return res.status(error.statusCode).json({ success: false, message: error.message, ...(error.errors ? { errors: error.errors } : {}) });
  console.error(error);
  return res.status(500).json({ success: false, message: isProduction ? 'An unexpected error occurred.' : (error as Error).message });
};
