import { Inventory } from '../../models/Inventory';
import { StockMovementType, IQueryParams } from '../../types';

export class InventoryService {
  async getAllInventoryItems(queryParams: IQueryParams & { warehouse?: string; lowStock?: boolean }) {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'product.name', 
      order = 'asc', 
      warehouse,
      lowStock
    } = queryParams;

    const filter: any = {};
    
    if (warehouse) {
      filter['location.warehouse'] = warehouse;
    }
    
    if (lowStock) {
      filter.$expr = { $lte: ['$currentStock', '$reorderPoint'] };
    }

    const sortObj: any = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    const pageNum = parseInt(page.toString());
    const limitNum = parseInt(limit.toString());
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Inventory.find(filter)
        .populate('product', 'name partNumber category')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum),
      Inventory.countDocuments(filter)
    ]);

    return {
      items,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum
      }
    };
  }

  async getInventoryItemById(id: string) {
    const item = await Inventory.findById(id)
      .populate('product', 'name partNumber category unitPrice')
      .populate('stockMovements.performedBy', 'firstName lastName');

    if (!item) {
      throw new Error('Inventory item not found');
    }

    return item;
  }

  async createInventoryItem(itemData: any) {
    const existingItem = await Inventory.findOne({ product: itemData.product });
    
    if (existingItem) {
      throw new Error('Inventory item for this product already exists');
    }

    const item = await Inventory.create(itemData);
    return item;
  }

  async updateInventoryItem(id: string, updateData: any) {
    const item = await Inventory.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('product', 'name partNumber');

    if (!item) {
      throw new Error('Inventory item not found');
    }

    return item;
  }

  async adjustStock(id: string, adjustmentData: {
    quantity: number;
    reason: string;
    type?: StockMovementType;
    reference?: string;
    cost?: number;
  }, userId: string) {
    const { quantity, reason, type = StockMovementType.ADJUSTMENT, reference, cost } = adjustmentData;

    const item = await Inventory.findById(id);
    
    if (!item) {
      throw new Error('Inventory item not found');
    }

    const newStock = item.currentStock + quantity;
    
    if (newStock < 0) {
      throw new Error('Insufficient stock for this operation');
    }

    const stockMovement = {
      type,
      quantity,
      reference: reference || `ADJ-${Date.now()}`,
      reason,
      performedBy: userId,
      timestamp: new Date(),
      cost
    };

    item.currentStock = newStock;
    item.stockMovements.push(stockMovement as any);
    item.lastStockUpdate = new Date();

    await item.save();

    return item;
  }

  async getLowStockItems() {
    const items = await Inventory.find({
      $expr: { $lte: ['$currentStock', '$reorderPoint'] }
    })
    .populate('product', 'name partNumber category supplier')
    .populate('product.supplier', 'name contactPerson email phone');

    return items;
  }

  async getInventoryByWarehouse(warehouse: string) {
    const items = await Inventory.find({
      'location.warehouse': warehouse
    })
    .populate('product', 'name partNumber category')
    .sort({ 'location.zone': 1, 'location.aisle': 1, 'location.shelf': 1 });

    return items;
  }

  async getStockMovements(id: string) {
    const item = await Inventory.findById(id)
      .populate('stockMovements.performedBy', 'firstName lastName')
      .select('stockMovements product');

    if (!item) {
      throw new Error('Inventory item not found');
    }

    return item.stockMovements.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}