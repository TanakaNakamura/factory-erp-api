import { InventoryState } from './InventoryStateBase';

export class LowStockState extends InventoryState {
  canReserve(quantity: number): boolean {
    return this.context.getCurrentStock() >= quantity;
  }

  canFulfill(quantity: number): boolean {
    return this.context.getCurrentStock() >= quantity;
  }

  getStatusMessage(): string {
    return `Low stock warning: Only ${this.context.getCurrentStock()} units remaining`;
  }

  getRecommendedActions(): string[] {
    return [
      'Immediate reorder required',
      'Contact supplier for expedited delivery',
      'Consider alternative suppliers'
    ];
  }
}