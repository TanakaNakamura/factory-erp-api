import { Order } from '../../models/Order';
import { Inventory } from '../../models/Inventory';
import { OrderStatus, OrderType, StockMovementType, IQueryParams } from '../../types';
import { OrderStatusManager } from './OrderStatusStrategy';

export class OrderService {
  private statusManager: OrderStatusManager;

  constructor() {
    this.statusManager = new OrderStatusManager();
  }

  async getAllOrders(queryParams: IQueryParams & { 
    status?: OrderStatus;
    type?: OrderType;
    startDate?: string;
    endDate?: string;
  }) {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'orderDate', 
      order = 'desc',
      status,
      type,
      startDate,
      endDate
    } = queryParams;

    const filter: any = {};
    
    if (status) filter.status = status;
    if (type) filter.type = type;
    
    if (startDate || endDate) {
      filter.orderDate = {};
      if (startDate) filter.orderDate.$gte = new Date(startDate);
      if (endDate) filter.orderDate.$lte = new Date(endDate);
    }

    const sortObj: any = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    const pageNum = parseInt(page.toString());
    const limitNum = parseInt(limit.toString());
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('customer', 'name customerCode')
        .populate('supplier', 'name supplierCode')
        .populate('items.product', 'name partNumber')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments(filter)
    ]);

    return {
      orders,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum
      }
    };
  }

  async getOrderById(id: string) {
    const order = await Order.findById(id)
      .populate('customer', 'name customerCode email phone contactPerson')
      .populate('supplier', 'name supplierCode email phone contactPerson')
      .populate('items.product', 'name partNumber unitPrice');

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }

  async createOrder(orderData: any) {
    const order = await Order.create(orderData);
    await order.populate('customer', 'name customerCode');
    await order.populate('supplier', 'name supplierCode');
    await order.populate('items.product', 'name partNumber');
    
    return order;
  }

  async updateOrder(id: string, updateData: any) {
    const order = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('customer', 'name customerCode')
     .populate('supplier', 'name supplierCode')
     .populate('items.product', 'name partNumber');

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }

  async updateOrderStatus(id: string, status: OrderStatus, userId: string) {
    const order = await Order.findById(id);
    
    if (!order) {
      throw new Error('Order not found');
    }

    const currentStatus = order.status;
    
    if (!this.statusManager.canTransition(currentStatus, status)) {
      const availableTransitions = this.statusManager.getAvailableTransitions(currentStatus);
      throw new Error(
        `Cannot transition from ${currentStatus} to ${status}. Available transitions: ${availableTransitions.join(', ')}`
      );
    }

    await this.statusManager.executeStatusChange(id, currentStatus, status);
    
    order.status = status;
    await order.save();
    return order;
  }

  async fulfillOrder(id: string, userId: string) {
    const order = await Order.findById(id).populate('items.product');
    
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== OrderStatus.APPROVED) {
      throw new Error('Order must be approved before fulfillment');
    }

    for (const item of order.items) {
      const inventory = await Inventory.findOne({ product: item.product });
      
      if (!inventory) {
        throw new Error(`No inventory found for product`);
      }

      if (inventory.currentStock < item.quantity) {
        throw new Error(`Insufficient stock for fulfillment`);
      }

      inventory.currentStock -= item.quantity;
      inventory.stockMovements.push({
        type: StockMovementType.OUTBOUND,
        quantity: -item.quantity,
        reference: order.orderNumber,
        reason: `Order fulfillment - ${order.orderNumber}`,
        performedBy: userId,
        timestamp: new Date(),
        cost: item.unitPrice * item.quantity
      } as any);

      await inventory.save();
    }

    await this.updateOrderStatus(id, OrderStatus.SHIPPED, userId);
    return order;
  }

  async getOrdersByCustomer(customerId: string) {
    const orders = await Order.find({ customer: customerId })
      .populate('items.product', 'name partNumber')
      .sort({ orderDate: -1 });

    return orders;
  }

  async getOrdersBySupplier(supplierId: string) {
    const orders = await Order.find({ supplier: supplierId })
      .populate('items.product', 'name partNumber')
      .sort({ orderDate: -1 });

    return orders;
  }

  async getOrdersByDateRange(startDate: Date, endDate: Date) {
    const orders = await Order.find({
      orderDate: {
        $gte: startDate,
        $lte: endDate
      }
    })
    .populate('customer', 'name customerCode')
    .populate('supplier', 'name supplierCode')
    .sort({ orderDate: -1 });

    return orders;
  }

  getAvailableStatusTransitions(currentStatus: OrderStatus): OrderStatus[] {
    return this.statusManager.getAvailableTransitions(currentStatus);
  }
}