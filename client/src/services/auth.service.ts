import type { User } from '../types';
import { api } from './api';

export const authService = { login: (email: string, password: string) => api<{ token: string; user: User }>('/auth/login', { method: 'POST', body: { email, password } }) };
