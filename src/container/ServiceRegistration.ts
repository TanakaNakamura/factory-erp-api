import { DIContainer, ServiceLifetime, Injectable } from '../container';
import { AuthService } from '../services/auth/AuthService';
import { UserService } from '../services/auth/UserService';
import { ProductService } from '../services/ProductService';
import { CustomerService } from '../services/CustomerService';
import { SupplierService } from '../services/SupplierService';
import { InventoryService } from '../services/inventory/InventoryService';
import { OrderService } from '../services/order/OrderService';
import { OrderStatusManager } from '../services/order/OrderStatusManager';

import {
  PendingStatusStrategy,
  ApprovedStatusStrategy,
  InProgressStatusStrategy,
  ShippedStatusStrategy,
  DeliveredStatusStrategy,
  CancelledStatusStrategy
} from '../services/order/strategies';

export class ServiceRegistrationModule {
  static register(container: DIContainer): void {
    container.register('AuthService', AuthService, ServiceLifetime.SINGLETON);
    container.register('UserService', UserService, ServiceLifetime.SINGLETON);
    container.register(AuthService, AuthService, ServiceLifetime.SINGLETON);
    container.register(UserService, UserService, ServiceLifetime.SINGLETON);

    container.register('ProductService', ProductService, ServiceLifetime.SINGLETON);
    container.register('CustomerService', CustomerService, ServiceLifetime.SINGLETON);
    container.register('SupplierService', SupplierService, ServiceLifetime.SINGLETON);
    container.register('InventoryService', InventoryService, ServiceLifetime.SINGLETON);
    container.register('OrderService', OrderService, ServiceLifetime.SINGLETON);
    
    container.register(ProductService, ProductService, ServiceLifetime.SINGLETON);
    container.register(CustomerService, CustomerService, ServiceLifetime.SINGLETON);
    container.register(SupplierService, SupplierService, ServiceLifetime.SINGLETON);
    container.register(InventoryService, InventoryService, ServiceLifetime.SINGLETON);
    container.register(OrderService, OrderService, ServiceLifetime.SINGLETON);

    container.register('OrderStatusManager', OrderStatusManager, ServiceLifetime.SINGLETON);
    container.register(OrderStatusManager, OrderStatusManager, ServiceLifetime.SINGLETON);

    container.register('PendingStatusStrategy', PendingStatusStrategy, ServiceLifetime.SINGLETON);
    container.register('ApprovedStatusStrategy', ApprovedStatusStrategy, ServiceLifetime.SINGLETON);
    container.register('InProgressStatusStrategy', InProgressStatusStrategy, ServiceLifetime.SINGLETON);
    container.register('ShippedStatusStrategy', ShippedStatusStrategy, ServiceLifetime.SINGLETON);
    container.register('DeliveredStatusStrategy', DeliveredStatusStrategy, ServiceLifetime.SINGLETON);
    container.register('CancelledStatusStrategy', CancelledStatusStrategy, ServiceLifetime.SINGLETON);

    container.register(PendingStatusStrategy, PendingStatusStrategy, ServiceLifetime.SINGLETON);
    container.register(ApprovedStatusStrategy, ApprovedStatusStrategy, ServiceLifetime.SINGLETON);
    container.register(InProgressStatusStrategy, InProgressStatusStrategy, ServiceLifetime.SINGLETON);
    container.register(ShippedStatusStrategy, ShippedStatusStrategy, ServiceLifetime.SINGLETON);
    container.register(DeliveredStatusStrategy, DeliveredStatusStrategy, ServiceLifetime.SINGLETON);
    container.register(CancelledStatusStrategy, CancelledStatusStrategy, ServiceLifetime.SINGLETON);

    registerInventoryStates(container);
  }
}

function registerInventoryStates(container: DIContainer): void {
  import('../services/inventory').then(inventoryModule => {
    const {
      InventoryContext,
      AvailableState,
      LowStockState,
      OutOfStockState,
      ReservedState,
      DiscontinuedState
    } = inventoryModule;

    container.register('InventoryContext', InventoryContext, ServiceLifetime.TRANSIENT);
    container.register('AvailableState', AvailableState, ServiceLifetime.TRANSIENT);
    container.register('LowStockState', LowStockState, ServiceLifetime.TRANSIENT);
    container.register('OutOfStockState', OutOfStockState, ServiceLifetime.TRANSIENT);
    container.register('ReservedState', ReservedState, ServiceLifetime.TRANSIENT);
    container.register('DiscontinuedState', DiscontinuedState, ServiceLifetime.TRANSIENT);

    container.register(InventoryContext, InventoryContext, ServiceLifetime.TRANSIENT);
    container.register(AvailableState, AvailableState, ServiceLifetime.TRANSIENT);
    container.register(LowStockState, LowStockState, ServiceLifetime.TRANSIENT);
    container.register(OutOfStockState, OutOfStockState, ServiceLifetime.TRANSIENT);
    container.register(ReservedState, ReservedState, ServiceLifetime.TRANSIENT);
    container.register(DiscontinuedState, DiscontinuedState, ServiceLifetime.TRANSIENT);
  });
}

export class ServiceFactories {
  private static container: DIContainer;

  static setContainer(container: DIContainer): void {
    ServiceFactories.container = container;
  }

  static createAuthService(): AuthService {
    return ServiceFactories.container.resolve(AuthService);
  }

  static createUserService(): UserService {
    return ServiceFactories.container.resolve(UserService);
  }

  static createProductService(): ProductService {
    return ServiceFactories.container.resolve(ProductService);
  }

  static createCustomerService(): CustomerService {
    return ServiceFactories.container.resolve(CustomerService);
  }

  static createSupplierService(): SupplierService {
    return ServiceFactories.container.resolve(SupplierService);
  }

  static createInventoryService(): InventoryService {
    return ServiceFactories.container.resolve(InventoryService);
  }

  static createOrderService(): OrderService {
    return ServiceFactories.container.resolve(OrderService);
  }

  static createOrderStatusManager(): OrderStatusManager {
    return ServiceFactories.container.resolve(OrderStatusManager);
  }

  static create<T>(serviceType: new (...args: any[]) => T): T {
    return ServiceFactories.container.resolve(serviceType);
  }

  static createWith<T>(
    serviceType: new (...args: any[]) => T,
    ...args: any[]
  ): T {
    const instance = Object.create(serviceType.prototype);
    serviceType.apply(instance, args);
    return instance;
  }
}

export class ServiceResolver {
  private container: DIContainer;

  constructor(container: DIContainer) {
    this.container = container;
  }

  get<T>(serviceKey: string | (new (...args: any[]) => T)): T {
    return this.container.resolve(serviceKey);
  }

  tryGet<T>(serviceKey: string | (new (...args: any[]) => T)): T | undefined {
    return this.container.tryResolve(serviceKey);
  }

  has<T>(serviceKey: string | (new (...args: any[]) => T)): boolean {
    return this.container.isRegistered(serviceKey);
  }
}