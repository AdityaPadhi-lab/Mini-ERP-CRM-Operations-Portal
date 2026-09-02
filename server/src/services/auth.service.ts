import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/api.js';

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new ApiError(401, 'Invalid email or password.');
  const token = jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, { expiresIn: '8h' });
  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}
