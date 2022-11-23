import { InventoryState } from './InventoryStateBase';

export class OutOfStockState extends InventoryState {
  canReserve(quantity: number): boolean {
    return false;
  }

  canFulfill(quantity: number): boolean {
    return false;
  }

  getStatusMessage(): string {
    return 'Out of stock - no units available';
  }

  getRecommendedActions(): string[] {
    return [
      'Urgent reorder required',
      'Backorder customer requests',
      'Find alternative products',
      'Notify sales team of stock shortage'
    ];
  }
}