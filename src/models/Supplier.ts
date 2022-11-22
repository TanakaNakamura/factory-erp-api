import mongoose, { Schema, Document } from 'mongoose';
import { ISupplier, SupplierType, IAddress, IPaymentTerms } from '../types';

export interface ISupplierDocument extends ISupplier, Document {}

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

const supplierSchema = new Schema<ISupplierDocument>({
  supplierCode: {
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
    enum: Object.values(SupplierType),
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
  qualityRating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  deliveryRating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  isPreferred: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  certifications: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true
});

supplierSchema.index({ supplierCode: 1 });
supplierSchema.index({ name: 'text' });
supplierSchema.index({ type: 1 });
supplierSchema.index({ isActive: 1, isPreferred: 1 });
supplierSchema.index({ qualityRating: 1, deliveryRating: 1 });

export const Supplier = mongoose.model<ISupplierDocument>('Supplier', supplierSchema);