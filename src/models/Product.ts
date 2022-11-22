import mongoose, { Schema, Document } from 'mongoose';
import { IProduct, ProductCategory, ProductType, IProductSpecification, IDimensions } from '../types';

export interface IProductDocument extends IProduct, Document {}

const dimensionsSchema = new Schema<IDimensions>({
  length: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  unit: { type: String, required: true, default: 'mm' }
}, { _id: false });

const specificationSchema = new Schema<IProductSpecification>({
  name: { type: String, required: true },
  value: { type: String, required: true },
  unit: { type: String },
  tolerance: { type: String }
}, { _id: false });

const productSchema = new Schema<IProductDocument>({
  partNumber: {
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
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  category: {
    type: String,
    enum: Object.values(ProductCategory),
    required: true
  },
  type: {
    type: String,
    enum: Object.values(ProductType),
    required: true
  },
  specifications: [specificationSchema],
  dimensions: {
    type: dimensionsSchema,
    required: true
  },
  weight: {
    type: Number,
    required: true,
    min: 0
  },
  material: {
    type: String,
    required: true,
    trim: true
  },
  manufacturingProcess: [{
    type: String,
    trim: true
  }],
  qualityStandards: [{
    type: String,
    trim: true
  }],
  supplier: {
    type: Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
    uppercase: true
  },
  minimumOrderQuantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  leadTimeDays: {
    type: Number,
    required: true,
    min: 0,
    default: 7
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

productSchema.index({ partNumber: 1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, type: 1 });
productSchema.index({ supplier: 1 });
productSchema.index({ isActive: 1 });

export const Product = mongoose.model<IProductDocument>('Product', productSchema);