export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';
export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type MovementType = 'IN' | 'OUT';
export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface User { id: string; name: string; email: string; role: Role }
export interface Pagination { page: number; limit: number; total: number; totalPages: number }
export interface Customer {
  id: string; customerName: string; mobileNumber: string; email: string; businessName: string; gstNumber?: string | null; customerType: CustomerType; address: string; status: CustomerStatus; followUpDate?: string | null; notes?: string | null; createdAt: string; updatedAt: string; createdBy?: Pick<User, 'id' | 'name' | 'role'>; _count?: { challans: number }; followUps?: FollowUp[];
}
export interface FollowUp { id: string; note: string; followUpDate: string; createdAt: string; createdBy: Pick<User, 'id' | 'name' | 'role'> }
export interface Product { id: string; productName: string; sku: string; category: string; unitPrice: string | number; currentStock: number; minimumStockQuantity: number; warehouseLocation: string; createdAt: string; updatedAt: string }
export interface StockMovement { id: string; productId: string; quantity: number; movementType: MovementType; reason: string; createdAt: string; product: Pick<Product, 'id' | 'productName' | 'sku'>; createdBy: Pick<User, 'id' | 'name' | 'role'> }
export interface ChallanItem { id: string; productId: string; quantity: number; productNameSnapshot: string; skuSnapshot: string; unitPriceSnapshot: string | number; product?: Pick<Product, 'id' | 'productName' | 'sku' | 'currentStock' | 'warehouseLocation'> }
export interface Challan { id: string; challanNumber: string; customerId: string; status: ChallanStatus; totalQuantity: number; createdAt: string; updatedAt: string; confirmedAt?: string | null; customer: Pick<Customer, 'id' | 'customerName' | 'businessName' | 'mobileNumber' | 'email' | 'address' | 'gstNumber'>; createdBy: Pick<User, 'id' | 'name' | 'role'>; items: ChallanItem[]; _count?: { items: number } }
export interface Dashboard { totalCustomers: number; totalProducts: number; lowStockProducts: number; pendingFollowUps: number; todayChallans: number; recentChallans: Array<Pick<Challan, 'id' | 'challanNumber' | 'status' | 'totalQuantity' | 'createdAt'> & { customer: Pick<Customer, 'customerName' | 'businessName'>; _count: { items: number } }>; recentStockMovements: Array<Pick<StockMovement, 'id' | 'quantity' | 'movementType' | 'reason' | 'createdAt'> & { product: Pick<Product, 'productName' | 'sku'> }>; upcomingFollowUps: Array<Pick<Customer, 'id' | 'customerName' | 'businessName' | 'followUpDate' | 'status'>>; lowStockItems: Product[] }
