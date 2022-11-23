import { DIContainer } from './DIContainer';
import { ServiceLifetime, ServiceKey, Constructor, Factory } from './types';

export class ServiceFactory {
  private container: DIContainer;

  constructor(container: DIContainer) {
    this.container = container;
  }

  create<T>(key: ServiceKey<T>): T {
    return this.container.resolve(key);
  }

  createMany<T>(keys: ServiceKey<T>[]): T[] {
    return this.container.resolveMultiple(keys);
  }

  createWith<T>(constructor: Constructor<T>, ...dependencies: any[]): T {
    const factory = (...deps: any[]) => {
      const instance = Object.create(constructor.prototype);
      const result = constructor.apply(instance, deps);
      return result !== undefined ? result : instance;
    };

    return factory(...dependencies);
  }

  createByConstructor<T>(constructor: Constructor<T>, ...args: any[]): T {
    const instance = Object.create(constructor.prototype);
    const result = constructor.apply(instance, args);
    return result !== undefined ? result : instance;
  }

  createFactory<T>(key: ServiceKey<T>): () => T {
    return () => this.container.resolve(key);
  }

  createLazy<T>(key: ServiceKey<T>): () => T {
    let instance: T | undefined;
    let resolved = false;

    return () => {
      if (!resolved) {
        instance = this.container.resolve(key);
        resolved = true;
      }
      return instance!;
    };
  }
}

export class ServiceBuilder<T> {
  private container: DIContainer;
  private key?: ServiceKey<T>;
  private dependencies: any[] = [];
  private scopeId?: string;

  constructor(container: DIContainer) {
    this.container = container;
  }

  service(key: ServiceKey<T>): this {
    this.key = key;
    return this;
  }

  withDependencies(...deps: any[]): this {
    this.dependencies.push(...deps);
    return this;
  }

  withDependency(dep: any): this {
    this.dependencies.push(dep);
    return this;
  }

  inScope(scopeId: string): this {
    this.scopeId = scopeId;
    return this;
  }

  build(): T {
    if (!this.key) {
      throw new Error('Service key must be specified');
    }

    if (this.scopeId) {
      const scope = this.container.createScope(this.scopeId);
      return this.container.executeInScope(scope, () => {
        return this.container.resolve(this.key!);
      });
    }

    return this.container.resolve(this.key);
  }
}

export interface ActivationContext {
  serviceKey: ServiceKey;
  container: DIContainer;
  dependencies: any[];
  properties: Record<string, any>;
}

export class ServiceActivator {
  private container: DIContainer;
  private activationHooks: Map<string, (context: ActivationContext) => any> = new Map();

  constructor(container: DIContainer) {
    this.container = container;
  }

  registerHook(serviceKey: ServiceKey, hook: (context: ActivationContext) => any): void {
    const keyStr = this.getKeyString(serviceKey);
    this.activationHooks.set(keyStr, hook);
  }

  activate<T>(serviceKey: ServiceKey<T>, dependencies: any[] = [], properties: Record<string, any> = {}): T {
    const keyStr = this.getKeyString(serviceKey);
    const hook = this.activationHooks.get(keyStr);

    const context: ActivationContext = {
      serviceKey,
      container: this.container,
      dependencies,
      properties
    };

    if (hook) {
      return hook(context);
    }

    return this.container.resolve(serviceKey);
  }

  private getKeyString(key: ServiceKey): string {
    if (typeof key === 'string' || typeof key === 'symbol') {
      return key.toString();
    }
    
    if (typeof key === 'function') {
      return key.name || 'AnonymousClass';
    }
    
    return String(key);
  }
}