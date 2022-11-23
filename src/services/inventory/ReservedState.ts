import { InventoryState } from './InventoryStateBase';

export class ReservedState extends InventoryState {
  canReserve(quantity: number): boolean {
    const availableStock = this.context.getCurrentStock() - this.context.getReservedStock();
    return availableStock >= quantity;
  }

  canFulfill(quantity: number): boolean {
    return this.context.getCurrentStock() >= quantity;
  }

  getStatusMessage(): string {
    const available = this.context.getCurrentStock() - this.context.getReservedStock();
    return `${this.context.getReservedStock()} units reserved, ${available} units available`;
  }

  getRecommendedActions(): string[] {
    const available = this.context.getCurrentStock() - this.context.getReservedStock();
    const actions = ['Monitor reserved stock levels'];
    
    if (available <= 0) {
      actions.push('No additional reservations possible');
      actions.push('Consider increasing stock levels');
    }
    
    return actions;
  }
}