export enum InventoryStatus {
  AVAILABLE = 'available',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  RESERVED = 'reserved',
  DISCONTINUED = 'discontinued'
}

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