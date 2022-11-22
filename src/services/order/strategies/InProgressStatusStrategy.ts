import { OrderStatus } from '../../../types';
import { IOrderStatusStrategy } from '../IOrderStatusStrategy';

export class InProgressStatusStrategy implements IOrderStatusStrategy {
  canTransitionTo(targetStatus: OrderStatus): boolean {
    const allowedTransitions = [
      OrderStatus.SHIPPED,
      OrderStatus.CANCELLED
    ];
    return allowedTransitions.includes(targetStatus);
  }

  getAvailableTransitions(): OrderStatus[] {
    return [OrderStatus.SHIPPED, OrderStatus.CANCELLED];
  }

  async onStatusChange(orderId: string, fromStatus: OrderStatus, toStatus: OrderStatus): Promise<void> {
    console.log(`Order ${orderId} transitioning from ${fromStatus} to ${toStatus}`);
    if (toStatus === OrderStatus.SHIPPED) {
      console.log(`Order ${orderId} has been shipped`);
    }
  }
}