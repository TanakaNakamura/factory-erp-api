import { OrderStatus } from '../../../types';
import { IOrderStatusStrategy } from '../IOrderStatusStrategy';

export class ApprovedStatusStrategy implements IOrderStatusStrategy {
  canTransitionTo(targetStatus: OrderStatus): boolean {
    const allowedTransitions = [
      OrderStatus.IN_PROGRESS,
      OrderStatus.CANCELLED
    ];
    return allowedTransitions.includes(targetStatus);
  }

  getAvailableTransitions(): OrderStatus[] {
    return [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED];
  }

  async onStatusChange(orderId: string, fromStatus: OrderStatus, toStatus: OrderStatus): Promise<void> {
    console.log(`Order ${orderId} transitioning from ${fromStatus} to ${toStatus}`);
    if (toStatus === OrderStatus.IN_PROGRESS) {
      console.log(`Order ${orderId} is now being processed`);
    }
  }
}