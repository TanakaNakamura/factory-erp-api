export interface IUser {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  SUPERVISOR = 'supervisor',
  OPERATOR = 'operator',
  VIEWER = 'viewer'
}

export interface IProduct {
  partNumber: string;
  name: string;
  description: string;
  category: ProductCategory;
  type: ProductType;
  specifications: IProductSpecification[];
  dimensions: IDimensions;
  weight: number;
  material: string;
  manufacturingProcess: string[];
  qualityStandards: string[];
  supplier?: string;
  unitPrice: number;
  currency: string;
  minimumOrderQuantity: number;
  leadTimeDays: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum ProductCategory {
  ENGINE_PARTS = 'engine_parts',
  TRANSMISSION = 'transmission',
  BRAKES = 'brakes',
  SUSPENSION = 'suspension',
  ELECTRICAL = 'electrical',
  BODY_PARTS = 'body_parts',
  INTERIOR = 'interior',
  TOOLS = 'tools',
  RAW_MATERIALS = 'raw_materials'
}

export enum ProductType {
  FINISHED_GOOD = 'finished_good',
  RAW_MATERIAL = 'raw_material',
  COMPONENT = 'component',
  ASSEMBLY = 'assembly',
  TOOL = 'tool'
}

export interface IProductSpecification {
  name: string;
  value: string;
  unit?: string;
  tolerance?: string;
}

export interface IDimensions {
  length: number;
  width: number;
  height: number;
  unit: string;
}

export interface IInventoryItem {
  product: string; // Product ID reference
  location: IStorageLocation;
  currentStock: number;
  reservedStock: number;
  availableStock?: number;
  minimumStock: number;
  maximumStock: number;
  reorderPoint: number;
  averageCost: number;
  lastStockUpdate?: Date;
  stockMovements: IStockMovement[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IStorageLocation {
  warehouse: string;
  zone: string;
  aisle: string;
  shelf: string;
  bin?: string;
}

export interface IStockMovement {
  type: StockMovementType;
  quantity: number;
  reference: string;
  reason: string;
  performedBy: string; // User ID reference
  timestamp: Date;
  cost?: number;
}

export enum StockMovementType {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment',
  PRODUCTION = 'production',
  RETURN = 'return'
}

export interface IOrder {
  orderNumber: string;
  type: OrderType;
  customer?: string; // Customer ID reference (for sales orders)
  supplier?: string; // Supplier ID reference (for purchase orders)
  status: OrderStatus;
  priority: OrderPriority;
  items: IOrderItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  requestedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  shippingAddress: IAddress;
  billingAddress?: IAddress;
  notes?: string;
  createdBy: string; // User ID reference
  approvedBy?: string; // User ID reference
  createdAt?: Date;
  updatedAt?: Date;
}

export enum OrderType {
  SALES = 'sales',
  PURCHASE = 'purchase',
  PRODUCTION = 'production',
  TRANSFER = 'transfer'
}

export enum OrderStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  IN_PROGRESS = 'in_progress',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum OrderPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface IOrderItem {
  product: string; // Product ID reference
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  deliveryDate?: Date;
  status: OrderItemStatus;
}

export enum OrderItemStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PRODUCTION = 'in_production',
  READY = 'ready',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered'
}

export interface ICustomer {
  customerCode: string;
  name: string;
  type: CustomerType;
  contactPerson: string;
  email: string;
  phone: string;
  address: IAddress;
  paymentTerms: IPaymentTerms;
  creditLimit: number;
  taxId?: string;
  isActive: boolean;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum CustomerType {
  OEM = 'oem',
  DISTRIBUTOR = 'distributor',
  RETAILER = 'retailer',
  END_USER = 'end_user'
}

export interface ISupplier {
  supplierCode: string;
  name: string;
  type: SupplierType;
  contactPerson: string;
  email: string;
  phone: string;
  address: IAddress;
  paymentTerms: IPaymentTerms;
  qualityRating: number;
  deliveryRating: number;
  isPreferred: boolean;
  isActive: boolean;
  certifications: string[];
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum SupplierType {
  MATERIAL = 'material',
  COMPONENT = 'component',
  TOOLING = 'tooling',
  SERVICE = 'service'
}

export interface IAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface IPaymentTerms {
  days: number;
  description: string;
  discountPercent?: number;
  discountDays?: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: IPagination;
}

export interface IPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// Query Parameters
export interface IQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filter?: Record<string, any>;
}