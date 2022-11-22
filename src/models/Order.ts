import mongoose, { Schema, Document } from 'mongoose';
import { IOrder, OrderType, OrderStatus, OrderPriority, IOrderItem, OrderItemStatus, IAddress } from '../types';

export interface IOrderDocument extends IOrder, Document {}

const addressSchema = new Schema<IAddress>({
  street: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  postalCode: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true }
}, { _id: false });

const orderItemSchema = new Schema<IOrderItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryDate: {
    type: Date
  },
  status: {
    type: String,
    enum: Object.values(OrderItemStatus),
    default: OrderItemStatus.PENDING
  }
}, { _id: true });

const orderSchema = new Schema<IOrderDocument>({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  type: {
    type: String,
    enum: Object.values(OrderType),
    required: true
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'Customer'
  },
  supplier: {
    type: Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  status: {
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.DRAFT
  },
  priority: {
    type: String,
    enum: Object.values(OrderPriority),
    default: OrderPriority.NORMAL
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  taxAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
    uppercase: true
  },
  requestedDeliveryDate: {
    type: Date,
    required: true
  },
  actualDeliveryDate: {
    type: Date
  },
  shippingAddress: {
    type: addressSchema,
    required: true
  },
  billingAddress: {
    type: addressSchema
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

orderSchema.index({ orderNumber: 1 });
orderSchema.index({ type: 1, status: 1 });
orderSchema.index({ customer: 1 });
orderSchema.index({ supplier: 1 });
orderSchema.index({ createdBy: 1 });
orderSchema.index({ requestedDeliveryDate: 1 });


orderSchema.pre('save', function(next) {
  this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  this.totalAmount = this.subtotal + this.taxAmount;
  next();
});

export const Order = mongoose.model<IOrderDocument>('Order', orderSchema);