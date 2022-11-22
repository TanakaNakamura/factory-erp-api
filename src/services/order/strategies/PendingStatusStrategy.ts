import { OrderStatus } from '../../../types';
import { IOrderStatusStrategy } from '../IOrderStatusStrategy';

export class PendingStatusStrategy implements IOrderStatusStrategy {
  canTransitionTo(targetStatus: OrderStatus): boolean {
    const allowedTransitions = [
      OrderStatus.APPROVED,
      OrderStatus.CANCELLED
    ];
    return allowedTransitions.includes(targetStatus);
  }

  getAvailableTransitions(): OrderStatus[] {
    return [OrderStatus.APPROVED, OrderStatus.CANCELLED];
  }

  async onStatusChange(orderId: string, fromStatus: OrderStatus, toStatus: OrderStatus): Promise<void> {
    console.log(`Order ${orderId} transitioning from ${fromStatus} to ${toStatus}`);
    if (toStatus === OrderStatus.APPROVED) {
      console.log(`Order ${orderId} approved - inventory reservation may be needed`);
    }
  }
}