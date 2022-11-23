import { InventoryContext } from './InventoryContext';

export abstract class InventoryState {
  abstract canReserve(quantity: number): boolean;
  abstract canFulfill(quantity: number): boolean;
  abstract getStatusMessage(): string;
  abstract getRecommendedActions(): string[];
  
  protected context: InventoryContext;
  
  constructor(context: InventoryContext) {
    this.context = context;
  }
}