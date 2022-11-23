import { InventoryState } from './InventoryStateBase';
import { InventoryStatus } from './InventoryStatus';
import { AvailableState } from './AvailableState';
import { LowStockState } from './LowStockState';
import { OutOfStockState } from './OutOfStockState';
import { ReservedState } from './ReservedState';
import { DiscontinuedState } from './DiscontinuedState';

export class InventoryContext {
  private currentStock: number;
  private reservedStock: number;
  private reorderPoint: number;
  private state: InventoryState;

  constructor(currentStock: number, reservedStock: number = 0, reorderPoint: number = 10) {
    this.currentStock = currentStock;
    this.reservedStock = reservedStock;
    this.reorderPoint = reorderPoint;
    this.state = this.determineState();
  }

  private determineState(): InventoryState {
    if (this.currentStock === 0) {
      return new OutOfStockState(this);
    } else if (this.currentStock <= this.reorderPoint) {
      return new LowStockState(this);
    } else if (this.reservedStock > 0) {
      return new ReservedState(this);
    } else {
      return new AvailableState(this);
    }
  }

  setState(state: InventoryState): void {
    this.state = state;
  }

  updateStock(newStock: number): void {
    this.currentStock = newStock;
    this.state = this.determineState();
  }

  updateReservedStock(reserved: number): void {
    this.reservedStock = reserved;
    this.state = this.determineState();
  }

  getCurrentStock(): number {
    return this.currentStock;
  }

  getReservedStock(): number {
    return this.reservedStock;
  }

  getReorderPoint(): number {
    return this.reorderPoint;
  }

  canReserve(quantity: number): boolean {
    return this.state.canReserve(quantity);
  }

  canFulfill(quantity: number): boolean {
    return this.state.canFulfill(quantity);
  }

  getStatus(): InventoryStatus {
    if (this.state instanceof OutOfStockState) return InventoryStatus.OUT_OF_STOCK;
    if (this.state instanceof LowStockState) return InventoryStatus.LOW_STOCK;
    if (this.state instanceof ReservedState) return InventoryStatus.RESERVED;
    if (this.state instanceof DiscontinuedState) return InventoryStatus.DISCONTINUED;
    return InventoryStatus.AVAILABLE;
  }

  getStatusMessage(): string {
    return this.state.getStatusMessage();
  }

  getRecommendedActions(): string[] {
    return this.state.getRecommendedActions();
  }

  markAsDiscontinued(): void {
    this.setState(new DiscontinuedState(this));
  }

  getAvailableStock(): number {
    return Math.max(0, this.currentStock - this.reservedStock);
  }
}