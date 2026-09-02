import type { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; name: string; email: string; role: UserRole };
    }
  }
}

export {};
