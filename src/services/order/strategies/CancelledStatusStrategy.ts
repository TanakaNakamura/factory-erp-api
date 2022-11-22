import { OrderStatus } from '../../../types';
import { IOrderStatusStrategy } from '../IOrderStatusStrategy';

export class CancelledStatusStrategy implements IOrderStatusStrategy {
  canTransitionTo(targetStatus: OrderStatus): boolean {
    return false;
  }

  getAvailableTransitions(): OrderStatus[] {
    return [];
  }

  async onStatusChange(orderId: string, fromStatus: OrderStatus, toStatus: OrderStatus): Promise<void> {
    console.log(`Order ${orderId} is cancelled - no further transitions allowed`);
  }
}