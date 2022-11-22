import mongoose, { Schema, Document } from 'mongoose';
import { IInventoryItem, IStorageLocation, IStockMovement, StockMovementType } from '../types';

export interface IInventoryDocument extends IInventoryItem, Document {}

const storageLocationSchema = new Schema<IStorageLocation>({
  warehouse: { type: String, required: true, trim: true },
  zone: { type: String, required: true, trim: true },
  aisle: { type: String, required: true, trim: true },
  shelf: { type: String, required: true, trim: true },
  bin: { type: String, trim: true }
}, { _id: false });

const stockMovementSchema = new Schema({
  type: {
    type: String,
    enum: Object.values(StockMovementType),
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  reference: {
    type: String,
    required: true,
    trim: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  performedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  cost: {
    type: Number,
    min: 0
  }
}, { _id: true });

const inventorySchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    unique: true
  },
  location: {
    type: storageLocationSchema,
    required: true
  },
  currentStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  reservedStock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  minimumStock: {
    type: Number,
    required: true,
    min: 0,
    default: 10
  },
  maximumStock: {
    type: Number,
    required: true,
    min: 0,
    default: 1000
  },
  reorderPoint: {
    type: Number,
    required: true,
    min: 0,
    default: 20
  },
  averageCost: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  lastStockUpdate: {
    type: Date,
    default: Date.now
  },
  stockMovements: [stockMovementSchema]
}, {
  timestamps: true
});

// Virtual field for available stock
inventorySchema.virtual('availableStock').get(function() {
  return Math.max(0, this.currentStock - this.reservedStock);
});

// Ensure virtual fields are serialized
inventorySchema.set('toJSON', { virtuals: true });
inventorySchema.set('toObject', { virtuals: true });

// Indexes for better query performance
inventorySchema.index({ product: 1 });
inventorySchema.index({ 'location.warehouse': 1 });
inventorySchema.index({ currentStock: 1 });
inventorySchema.index({ reorderPoint: 1, currentStock: 1 });

inventorySchema.pre('save', function(next) {
  if (this.isModified('currentStock') || this.isModified('reservedStock')) {
    this.lastStockUpdate = new Date();
  }
  next();
});

export const Inventory = mongoose.model<IInventoryDocument>('Inventory', inventorySchema);