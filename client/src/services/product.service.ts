import type { Pagination, Product } from '../types';
import { api, query } from './api';

export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { unitPrice: number };
type ListResponse<T> = { data: T[]; pagination: Pagination };
export const productService = {
  list: (filters: { page: number; limit: number; search?: string; category?: string; lowStock?: boolean }) => api<ListResponse<Product>>(`/products${query(filters)}`),
  get: (id: string) => api<Product>(`/products/${id}`),
  create: (input: ProductInput) => api<Product>('/products', { method: 'POST', body: input }),
  update: (id: string, input: ProductInput) => api<Product>(`/products/${id}`, { method: 'PUT', body: input }),
  categories: () => api<Array<{ category: string }>>('/products/meta/categories'),
};
