import { OrderStatus } from '../../types';

export interface IOrderStatusStrategy {
  canTransitionTo(targetStatus: OrderStatus): boolean;
  getAvailableTransitions(): OrderStatus[];
  onStatusChange(orderId: string, fromStatus: OrderStatus, toStatus: OrderStatus): Promise<void>;
}