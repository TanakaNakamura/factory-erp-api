db = db.getSiblingDB('factory_erp');


db.createCollection('users');
db.createCollection('products');
db.createCollection('inventory');
db.createCollection('orders');
db.createCollection('customers');
db.createCollection('suppliers');

db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

db.products.createIndex({ partNumber: 1 }, { unique: true });
db.products.createIndex({ name: 'text', description: 'text' });
db.products.createIndex({ category: 1, type: 1 });
db.products.createIndex({ supplier: 1 });
db.products.createIndex({ isActive: 1 });

db.inventory.createIndex({ product: 1 }, { unique: true });
db.inventory.createIndex({ 'location.warehouse': 1 });
db.inventory.createIndex({ currentStock: 1 });
db.inventory.createIndex({ reorderPoint: 1, currentStock: 1 });

db.orders.createIndex({ orderNumber: 1 }, { unique: true });
db.orders.createIndex({ type: 1, status: 1 });
db.orders.createIndex({ customer: 1 });
db.orders.createIndex({ supplier: 1 });
db.orders.createIndex({ createdBy: 1 });
db.orders.createIndex({ requestedDeliveryDate: 1 });

db.customers.createIndex({ customerCode: 1 }, { unique: true });
db.customers.createIndex({ name: 'text' });
db.customers.createIndex({ type: 1 });
db.customers.createIndex({ isActive: 1 });

db.suppliers.createIndex({ supplierCode: 1 }, { unique: true });
db.suppliers.createIndex({ name: 'text' });
db.suppliers.createIndex({ type: 1 });
db.suppliers.createIndex({ isActive: 1, isPreferred: 1 });
db.suppliers.createIndex({ qualityRating: 1, deliveryRating: 1 });

print('Factory ERP database initialized successfully!');