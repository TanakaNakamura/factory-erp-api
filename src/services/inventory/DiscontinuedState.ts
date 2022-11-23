import { InventoryState } from './InventoryStateBase';

export class DiscontinuedState extends InventoryState {
  canReserve(quantity: number): boolean {
    return this.context.getCurrentStock() >= quantity;
  }

  canFulfill(quantity: number): boolean {
    return this.context.getCurrentStock() >= quantity;
  }

  getStatusMessage(): string {
    return `Discontinued product - ${this.context.getCurrentStock()} units remaining (no restocking)`;
  }

  getRecommendedActions(): string[] {
    return [
      'Product discontinued - no reordering',
      'Sell remaining stock',
      'Suggest alternative products to customers',
      'Plan phase-out strategy'
    ];
  }
}