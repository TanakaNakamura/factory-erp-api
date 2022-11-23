import { InventoryState } from './InventoryStateBase';

export class AvailableState extends InventoryState {
  canReserve(quantity: number): boolean {
    return this.context.getCurrentStock() >= quantity;
  }

  canFulfill(quantity: number): boolean {
    return this.context.getCurrentStock() >= quantity;
  }

  getStatusMessage(): string {
    return `In stock: ${this.context.getCurrentStock()} units available`;
  }

  getRecommendedActions(): string[] {
    const stock = this.context.getCurrentStock();
    const reorderPoint = this.context.getReorderPoint();
    
    if (stock <= reorderPoint) {
      return ['Consider reordering - approaching low stock level'];
    }
    return ['Stock levels are healthy'];
  }
}