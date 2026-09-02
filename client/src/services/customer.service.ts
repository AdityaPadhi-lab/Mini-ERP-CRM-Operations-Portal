import type { Customer, CustomerStatus, CustomerType, FollowUp, Pagination } from '../types';
import { api, query } from './api';

export type CustomerInput = Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | '_count' | 'followUps'>;
type ListResponse<T> = { data: T[]; pagination: Pagination };
export const customerService = {
  list: (filters: { page: number; limit: number; search?: string; status?: CustomerStatus; customerType?: CustomerType }) => api<ListResponse<Customer>>(`/customers${query(filters)}`),
  get: (id: string) => api<Customer>(`/customers/${id}`),
  create: (input: CustomerInput) => api<Customer>('/customers', { method: 'POST', body: input }),
  update: (id: string, input: CustomerInput) => api<Customer>(`/customers/${id}`, { method: 'PUT', body: input }),
  remove: (id: string) => api<void>(`/customers/${id}`, { method: 'DELETE' }),
  followUps: (id: string) => api<FollowUp[]>(`/customers/${id}/followups`),
  addFollowUp: (id: string, input: { note: string; followUpDate: string }) => api<FollowUp>(`/customers/${id}/followups`, { method: 'POST', body: input }),
};
