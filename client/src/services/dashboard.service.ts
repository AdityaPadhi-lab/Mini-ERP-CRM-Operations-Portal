import type { Dashboard } from '../types';
import { api } from './api';
export const dashboardService = { stats: () => api<Dashboard>('/dashboard/stats') };
