import { OrderStatus } from '../../types';
import { IOrderStatusStrategy } from './IOrderStatusStrategy';
import {
  PendingStatusStrategy,
  ApprovedStatusStrategy,
  InProgressStatusStrategy,
  ShippedStatusStrategy,
  DeliveredStatusStrategy,
  CancelledStatusStrategy
} from './strategies';

export class OrderStatusManager {
  private strategies: Map<OrderStatus, IOrderStatusStrategy>;

  constructor() {
    this.strategies = new Map([
      [OrderStatus.PENDING, new PendingStatusStrategy()],
      [OrderStatus.APPROVED, new ApprovedStatusStrategy()],
      [OrderStatus.IN_PROGRESS, new InProgressStatusStrategy()],
      [OrderStatus.SHIPPED, new ShippedStatusStrategy()],
      [OrderStatus.DELIVERED, new DeliveredStatusStrategy()],
      [OrderStatus.CANCELLED, new CancelledStatusStrategy()]
    ]);
  }

  canTransition(currentStatus: OrderStatus, targetStatus: OrderStatus): boolean {
    const strategy = this.strategies.get(currentStatus);
    if (!strategy) {
      throw new Error(`Unknown order status: ${currentStatus}`);
    }
    return strategy.canTransitionTo(targetStatus);
  }

  getAvailableTransitions(currentStatus: OrderStatus): OrderStatus[] {
    const strategy = this.strategies.get(currentStatus);
    if (!strategy) {
      throw new Error(`Unknown order status: ${currentStatus}`);
    }
    return strategy.getAvailableTransitions();
  }

  async executeStatusChange(orderId: string, currentStatus: OrderStatus, targetStatus: OrderStatus): Promise<void> {
    if (!this.canTransition(currentStatus, targetStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${targetStatus}`);
    }

    const strategy = this.strategies.get(currentStatus);
    if (strategy) {
      await strategy.onStatusChange(orderId, currentStatus, targetStatus);
    }
  }
}