import { OrderStatus } from '../../../types';
import { IOrderStatusStrategy } from '../IOrderStatusStrategy';

export class ShippedStatusStrategy implements IOrderStatusStrategy {
  canTransitionTo(targetStatus: OrderStatus): boolean {
    const allowedTransitions = [OrderStatus.DELIVERED];
    return allowedTransitions.includes(targetStatus);
  }

  getAvailableTransitions(): OrderStatus[] {
    return [OrderStatus.DELIVERED];
  }

  async onStatusChange(orderId: string, fromStatus: OrderStatus, toStatus: OrderStatus): Promise<void> {
    console.log(`Order ${orderId} transitioning from ${fromStatus} to ${toStatus}`);
    if (toStatus === OrderStatus.DELIVERED) {
      console.log(`Order ${orderId} has been delivered - completing order lifecycle`);
    }
  }
}