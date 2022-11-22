import mongoose, { Schema, Document } from 'mongoose';
import { ICustomer, CustomerType, IAddress, IPaymentTerms } from '../types';

export interface ICustomerDocument extends ICustomer, Document {}

const addressSchema = new Schema<IAddress>({
  street: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  postalCode: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true }
}, { _id: false });

const paymentTermsSchema = new Schema<IPaymentTerms>({
  days: { type: Number, required: true, min: 0 },
  description: { type: String, required: true, trim: true },
  discountPercent: { type: Number, min: 0, max: 100 },
  discountDays: { type: Number, min: 0 }
}, { _id: false });

const customerSchema = new Schema<ICustomerDocument>({
  customerCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  type: {
    type: String,
    enum: Object.values(CustomerType),
    required: true
  },
  contactPerson: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: addressSchema,
    required: true
  },
  paymentTerms: {
    type: paymentTermsSchema,
    required: true
  },
  creditLimit: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  taxId: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true
});

customerSchema.index({ customerCode: 1 });
customerSchema.index({ name: 'text' });
customerSchema.index({ type: 1 });
customerSchema.index({ isActive: 1 });

export const Customer = mongoose.model<ICustomerDocument>('Customer', customerSchema);