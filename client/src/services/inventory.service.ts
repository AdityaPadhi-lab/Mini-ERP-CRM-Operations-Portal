import type { MovementType, Pagination, StockMovement } from '../types';
import { api, query } from './api';

type ListResponse<T> = { data: T[]; pagination: Pagination };
export const inventoryService = {
  list: (filters: { page: number; limit: number; productId?: string; movementType?: MovementType; date?: string }) => api<ListResponse<StockMovement>>(`/stock-movements${query(filters)}`),
  create: (input: { productId: string; quantity: number; movementType: MovementType; reason: string }) => api<StockMovement>('/stock-movements', { method: 'POST', body: input }),
};
