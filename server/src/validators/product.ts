import { z } from 'zod';

export const productSchema = z.object({
  productName: z.string().trim().min(2).max(160),
  sku: z.string().trim().toUpperCase().min(2).max(50),
  category: z.string().trim().min(2).max(100),
  unitPrice: z.coerce.number().nonnegative().max(99999999),
  currentStock: z.coerce.number().int().nonnegative().default(0),
  minimumStockQuantity: z.coerce.number().int().nonnegative().default(0),
  warehouseLocation: z.string().trim().min(1).max(100),
});
