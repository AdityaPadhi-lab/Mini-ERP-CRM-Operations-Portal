import { prisma } from '../config/prisma.js';

export async function dashboardStats() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const [totalCustomers, totalProducts, products, pendingFollowUps, todayChallans, recentChallans, recentStockMovements, upcomingFollowUps] = await Promise.all([
    prisma.customer.count(),
    prisma.product.count(),
    prisma.product.findMany({ orderBy: { currentStock: 'asc' }, take: 8 }),
    prisma.customer.count({ where: { followUpDate: { gte: start } } }),
    prisma.salesChallan.count({ where: { createdAt: { gte: start, lt: end } } }),
    prisma.salesChallan.findMany({ take: 6, orderBy: { createdAt: 'desc' }, include: { customer: { select: { customerName: true, businessName: true } }, _count: { select: { items: true } } } }),
    prisma.stockMovement.findMany({ take: 6, orderBy: { createdAt: 'desc' }, include: { product: { select: { productName: true, sku: true } } } }),
    prisma.customer.findMany({ where: { followUpDate: { not: null, gte: start } }, take: 6, orderBy: { followUpDate: 'asc' }, select: { id: true, customerName: true, businessName: true, followUpDate: true, status: true } }),
  ]);
  const lowStockProducts = products.filter((product) => product.currentStock <= product.minimumStockQuantity);
  return { totalCustomers, totalProducts, lowStockProducts: lowStockProducts.length, pendingFollowUps, todayChallans, recentChallans, recentStockMovements, upcomingFollowUps, lowStockItems: lowStockProducts };
}
