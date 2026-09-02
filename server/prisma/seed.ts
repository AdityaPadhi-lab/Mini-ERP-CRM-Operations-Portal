import bcrypt from 'bcryptjs';
import { ChallanStatus, CustomerStatus, CustomerType, MovementType, PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();
const day = (offset: number) => { const value = new Date(); value.setDate(value.getDate() + offset); return value; };

async function main() {
  await prisma.salesChallanItem.deleteMany();
  await prisma.salesChallan.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.customerFollowUp.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Demo@123', 12);
  const users = await Promise.all([
    prisma.user.create({ data: { name: 'Aarav Mehta', email: 'admin@example.com', passwordHash, role: UserRole.ADMIN } }),
    prisma.user.create({ data: { name: 'Priya Nair', email: 'sales@example.com', passwordHash, role: UserRole.SALES } }),
    prisma.user.create({ data: { name: 'Karan Shah', email: 'warehouse@example.com', passwordHash, role: UserRole.WAREHOUSE } }),
    prisma.user.create({ data: { name: 'Neha Iyer', email: 'accounts@example.com', passwordHash, role: UserRole.ACCOUNTS } }),
  ]);
  const [admin, sales, warehouse] = users;

  const customerData = [
    ['ABC Traders', 'ABC Wholesale Pvt Ltd', '9876501001', 'contact@abctraders.test', CustomerType.WHOLESALE, CustomerStatus.ACTIVE, 3],
    ['Shree Distributors', 'Shree Distribution House', '9876501002', 'hello@shreedist.test', CustomerType.DISTRIBUTOR, CustomerStatus.ACTIVE, 7],
    ['Metro Wholesale', 'Metro Wholesale Supplies', '9876501003', 'orders@metrowholesale.test', CustomerType.WHOLESALE, CustomerStatus.LEAD, 2],
    ['Eastern Supplies', 'Eastern Supply Co', '9876501004', 'contact@easternsupplies.test', CustomerType.DISTRIBUTOR, CustomerStatus.ACTIVE, 10],
    ['Pioneer Retail', 'Pioneer Retail Stores', '9876501005', 'buy@pioneerretail.test', CustomerType.RETAIL, CustomerStatus.ACTIVE, 5],
    ['Navkar Enterprises', 'Navkar Enterprises', '9876501006', 'sales@navkar.test', CustomerType.WHOLESALE, CustomerStatus.LEAD, 1],
    ['Bluebird Stores', 'Bluebird Retail Network', '9876501007', 'contact@bluebird.test', CustomerType.RETAIL, CustomerStatus.INACTIVE, 14],
    ['Omni Mart', 'Omni Mart India', '9876501008', 'procurement@omnimart.test', CustomerType.RETAIL, CustomerStatus.ACTIVE, 4],
    ['Royal Distributors', 'Royal Distribution Services', '9876501009', 'orders@royal.test', CustomerType.DISTRIBUTOR, CustomerStatus.ACTIVE, 8],
    ['Vertex Trading', 'Vertex Trading Company', '9876501010', 'sales@vertex.test', CustomerType.WHOLESALE, CustomerStatus.LEAD, 6],
    ['Sunrise Retail', 'Sunrise Retail India', '9876501011', 'team@sunrise.test', CustomerType.RETAIL, CustomerStatus.ACTIVE, 9],
    ['Evergreen Agencies', 'Evergreen Agencies', '9876501012', 'contact@evergreen.test', CustomerType.DISTRIBUTOR, CustomerStatus.ACTIVE, 12],
    ['Crown Traders', 'Crown Traders', '9876501013', 'info@crown.test', CustomerType.WHOLESALE, CustomerStatus.LEAD, 2],
    ['Dharma Stores', 'Dharma Stores', '9876501014', 'orders@dharma.test', CustomerType.RETAIL, CustomerStatus.ACTIVE, 11],
    ['Orbit Enterprises', 'Orbit Enterprises', '9876501015', 'office@orbit.test', CustomerType.DISTRIBUTOR, CustomerStatus.ACTIVE, 15],
  ] as const;
  const customers = await Promise.all(customerData.map(([customerName, businessName, mobileNumber, email, customerType, status, followUpIn], index) =>
    prisma.customer.create({ data: { customerName, businessName, mobileNumber, email, customerType, status, gstNumber: `27AABCO${String(1000 + index)}F1Z${index % 9}`, address: `${index + 10}, Commerce Park, Mumbai, Maharashtra`, followUpDate: day(followUpIn), notes: index % 2 ? 'Preferred contact during business hours.' : 'Priority wholesale account.', createdById: sales.id } }),
  ));
  await prisma.customerFollowUp.createMany({ data: customers.slice(0, 7).flatMap((customer, index) => [
    { customerId: customer.id, note: 'Discussed replenishment requirements and next order window.', followUpDate: day(index + 2), createdById: sales.id, createdAt: day(-index - 2) },
    { customerId: customer.id, note: 'Shared current catalogue and pricing details.', followUpDate: day(index + 5), createdById: sales.id, createdAt: day(-index - 8) },
  ]) });

  const productData = [
    ['Laptop Carry Bag', 'BAG-001', 'Accessories', 850, 42, 12, 'A-01'], ['Wireless Keyboard', 'KEY-002', 'Peripherals', 1250, 18, 10, 'A-02'], ['Optical Mouse', 'MOU-003', 'Peripherals', 650, 75, 15, 'A-02'], ['USB-C Hub', 'HUB-004', 'Accessories', 2200, 9, 10, 'A-03'], ['27-inch Monitor', 'MON-005', 'Displays', 14900, 21, 5, 'B-01'], ['HDMI Cable 2m', 'CAB-006', 'Cables', 450, 120, 20, 'B-02'], ['Laptop Stand', 'STD-007', 'Accessories', 1850, 28, 8, 'A-04'], ['Webcam Pro', 'CAM-008', 'Peripherals', 3200, 12, 8, 'A-05'], ['Mechanical Keyboard', 'KEY-009', 'Peripherals', 3600, 6, 8, 'A-02'], ['Power Strip', 'PWR-010', 'Electrical', 950, 44, 12, 'C-01'], ['Desk Mat', 'MAT-011', 'Accessories', 700, 35, 10, 'C-02'], ['Ethernet Cable 5m', 'NET-012', 'Cables', 600, 82, 15, 'B-03'], ['Portable SSD 1TB', 'SSD-013', 'Storage', 7800, 16, 5, 'D-01'], ['USB Flash Drive 64GB', 'USB-014', 'Storage', 900, 65, 20, 'D-02'], ['Wireless Presenter', 'PRS-015', 'Peripherals', 1750, 14, 6, 'A-06'], ['Surge Protector', 'SRG-016', 'Electrical', 1450, 22, 7, 'C-03'], ['Notebook Pack', 'NTB-017', 'Stationery', 320, 90, 20, 'E-01'], ['Label Roll', 'LBL-018', 'Packaging', 280, 150, 30, 'E-02'], ['Packing Tape', 'TAP-019', 'Packaging', 160, 114, 25, 'E-03'], ['Barcode Scanner', 'BCR-020', 'Equipment', 4800, 7, 5, 'F-01'],
  ] as const;
  const products = await Promise.all(productData.map(([productName, sku, category, unitPrice, currentStock, minimumStockQuantity, warehouseLocation]) => prisma.product.create({ data: { productName, sku, category, unitPrice, currentStock, minimumStockQuantity, warehouseLocation } })));
  await prisma.stockMovement.createMany({ data: products.map((product) => ({ productId: product.id, quantity: product.currentStock + 20, movementType: MovementType.IN, reason: 'Opening inventory balance', createdById: warehouse.id })) });
  await prisma.stockMovement.createMany({ data: products.slice(0, 4).map((product, index) => ({ productId: product.id, quantity: 20, movementType: MovementType.OUT, reason: `Confirmed sales challan CH-${new Date().getFullYear()}-${String(index + 1).padStart(6, '0')}`, createdById: sales.id })) });

  const challanYear = new Date().getFullYear();
  for (let index = 0; index < 4; index += 1) {
    const itemProduct = products[index];
    await prisma.salesChallan.create({ data: {
      challanNumber: `CH-${challanYear}-${String(index + 1).padStart(6, '0')}`,
      customerId: customers[index].id,
      createdById: sales.id,
      status: index === 3 ? ChallanStatus.DRAFT : ChallanStatus.CONFIRMED,
      totalQuantity: index === 3 ? 5 : 20,
      confirmedAt: index === 3 ? null : day(-index - 2),
      createdAt: day(-index - 3),
      items: { create: [{ productId: itemProduct.id, quantity: index === 3 ? 5 : 20, productNameSnapshot: itemProduct.productName, skuSnapshot: itemProduct.sku, unitPriceSnapshot: itemProduct.unitPrice }] },
    } });
  }
  console.log('OpsFlow demo data created.');
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(() => prisma.$disconnect());
