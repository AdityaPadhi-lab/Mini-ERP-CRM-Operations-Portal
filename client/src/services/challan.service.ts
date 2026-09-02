import type { Challan, ChallanStatus, Pagination } from '../types';
import { api, query } from './api';

export type ChallanInput = { customerId: string; status: 'DRAFT'; items: Array<{ productId: string; quantity: number }> };
type ListResponse<T> = { data: T[]; pagination: Pagination };
export const challanService = {
  list: (filters: { page: number; limit: number; status?: ChallanStatus; search?: string; customerId?: string }) => api<ListResponse<Challan>>(`/challans${query(filters)}`),
  get: (id: string) => api<Challan>(`/challans/${id}`),
  create: (input: ChallanInput) => api<Challan>('/challans', { method: 'POST', body: input }),
  update: (id: string, input: ChallanInput) => api<Challan>(`/challans/${id}`, { method: 'PUT', body: input }),
  confirm: (id: string) => api<Challan>(`/challans/${id}/confirm`, { method: 'POST' }),
  cancel: (id: string) => api<Challan>(`/challans/${id}/cancel`, { method: 'POST' }),
};
