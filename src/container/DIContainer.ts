import {
  ServiceKey,
  ServiceDescriptor,
  ServiceRegistry,
  ServiceLifetime,
  DIScope,
  DIContainerConfig,
  Constructor,
  Factory,
  DIError,
  CircularDependencyError,
  ServiceNotFoundError
} from './types';

import {
  getInjectableMetadata,
  getInjectMetadata,
  getParameterTypes,
  getPropertyInjectMetadata
} from './decorators';

export class DIContainer {
  private services: ServiceRegistry = {};
  private singletons = new Map<string, any>();
  private currentScope?: DIScope;
  private dependencyStack: Set<string> = new Set();
  private config: DIContainerConfig;

  constructor(config: DIContainerConfig = {}) {
    this.config = {
      enableAutoDiscovery: true,
      enableCircularDependencyDetection: true,
      enableLogging: false,
      defaultLifetime: ServiceLifetime.TRANSIENT,
      ...config
    };
  }

  register<T>(
    key: ServiceKey<T>,
    constructor: Constructor<T>,
    lifetime: ServiceLifetime = this.config.defaultLifetime!
  ): this {
    const keyStr = this.getKeyString(key);
    
    this.services[keyStr] = {
      key,
      constructor,
      lifetime,
      dependencies: this.extractDependencies(constructor)
    };

    this.log(`Registered service: ${keyStr} (${lifetime})`);
    return this;
  }

  registerFactory<T>(
    key: ServiceKey<T>,
    factory: Factory<T>,
    lifetime: ServiceLifetime = this.config.defaultLifetime!,
    dependencies: ServiceKey[] = []
  ): this {
    const keyStr = this.getKeyString(key);
    
    this.services[keyStr] = {
      key,
      factory,
      lifetime,
      dependencies
    } as ServiceDescriptor;

    this.log(`Registered factory: ${keyStr} (${lifetime})`);
    return this;
  }

  registerInstance<T>(key: ServiceKey<T>, instance: T): this {
    const keyStr = this.getKeyString(key);
    
    this.services[keyStr] = {
      key,
      instance,
      lifetime: ServiceLifetime.SINGLETON
    } as ServiceDescriptor;

    this.singletons.set(keyStr, instance);
    this.log(`Registered instance: ${keyStr}`);
    return this;
  }

  registerMultiple(descriptors: ServiceDescriptor[]): this {
    descriptors.forEach(descriptor => {
      if (descriptor.constructor) {
        this.register(descriptor.key, descriptor.constructor, descriptor.lifetime);
      } else if (descriptor.factory) {
        this.registerFactory(descriptor.key, descriptor.factory, descriptor.lifetime, descriptor.dependencies);
      } else if (descriptor.instance !== undefined) {
        this.registerInstance(descriptor.key, descriptor.instance);
      }
    });
    return this;
  }

  resolve<T>(key: ServiceKey<T>): T {
    const keyStr = this.getKeyString(key);
    
    if (this.config.enableCircularDependencyDetection) {
      if (this.dependencyStack.has(keyStr)) {
        throw new CircularDependencyError([...this.dependencyStack, keyStr]);
      }
      this.dependencyStack.add(keyStr);
    }

    try {
      const service = this.resolveInternal<T>(key);
      return service;
    } finally {
      if (this.config.enableCircularDependencyDetection) {
        this.dependencyStack.delete(keyStr);
      }
    }
  }

  tryResolve<T>(key: ServiceKey<T>): T | undefined {
    try {
      return this.resolve(key);
    } catch (error) {
      if (error instanceof ServiceNotFoundError) {
        return undefined;
      }
      throw error;
    }
  }

  resolveMultiple<T>(keys: ServiceKey<T>[]): T[] {
    return keys.map(key => this.resolve(key));
  }

  isRegistered<T>(key: ServiceKey<T>): boolean {
    const keyStr = this.getKeyString(key);
    return keyStr in this.services;
  }

  createScope(id: string = this.generateScopeId()): DIScope {
    return {
      id,
      services: new Map(),
      parent: this.currentScope
    };
  }

  enterScope(scope: DIScope): void {
    this.currentScope = scope;
  }

  exitScope(): void {
    if (this.currentScope) {
      this.currentScope = this.currentScope.parent;
    }
  }

  executeInScope<T>(scope: DIScope, fn: () => T): T {
    const previousScope = this.currentScope;
    this.enterScope(scope);
    
    try {
      return fn();
    } finally {
      this.currentScope = previousScope;
    }
  }

  getRegisteredKeys(): string[] {
    return Object.keys(this.services);
  }

  clear(): void {
    this.services = {};
    this.singletons.clear();
    this.currentScope = undefined;
    this.dependencyStack.clear();
  }

  private resolveInternal<T>(key: ServiceKey<T>): T {
    const keyStr = this.getKeyString(key);
    const descriptor = this.services[keyStr];

    if (!descriptor) {
        if (this.config.enableAutoDiscovery && typeof key === 'function') {
        return this.createInstance(key as Constructor<T>);
      }
      throw new ServiceNotFoundError(key);
    }

    switch (descriptor.lifetime) {
      case ServiceLifetime.SINGLETON:
        return this.resolveSingleton(descriptor);
      
      case ServiceLifetime.SCOPED:
        return this.resolveScoped(descriptor);
      
      case ServiceLifetime.TRANSIENT:
      default:
        return this.resolveTransient(descriptor);
    }
  }

  private resolveSingleton<T>(descriptor: ServiceDescriptor<T>): T {
    const keyStr = this.getKeyString(descriptor.key);
    
    if (descriptor.instance !== undefined) {
      return descriptor.instance;
    }

    if (this.singletons.has(keyStr)) {
      return this.singletons.get(keyStr);
    }

    const instance = this.createServiceInstance(descriptor);
    this.singletons.set(keyStr, instance);
    
    this.log(`Created singleton: ${keyStr}`);
    return instance;
  }

  private resolveScoped<T>(descriptor: ServiceDescriptor<T>): T {
    const keyStr = this.getKeyString(descriptor.key);
    
    if (!this.currentScope) {
      throw new DIError(`No scope available for scoped service: ${keyStr}`);
    }

    if (this.currentScope.services.has(keyStr)) {
      return this.currentScope.services.get(keyStr);
    }

    const instance = this.createServiceInstance(descriptor);
    this.currentScope.services.set(keyStr, instance);
    
    this.log(`Created scoped instance: ${keyStr} (scope: ${this.currentScope.id})`);
    return instance;
  }

  private resolveTransient<T>(descriptor: ServiceDescriptor<T>): T {
    const instance = this.createServiceInstance(descriptor);
    const keyStr = this.getKeyString(descriptor.key);
    
    this.log(`Created transient instance: ${keyStr}`);
    return instance;
  }

  private createServiceInstance<T>(descriptor: ServiceDescriptor<T>): T {
    if (descriptor.instance !== undefined) {
      return descriptor.instance;
    }

    if (descriptor.factory) {
      const dependencies = this.resolveDependencies(descriptor.dependencies || []);
      return descriptor.factory(...dependencies);
    }

    if (descriptor.constructor) {
      return this.createInstance(descriptor.constructor);
    }

    throw new DIError(`Invalid service descriptor for: ${this.getKeyString(descriptor.key)}`);
  }

  private createInstance<T>(constructor: Constructor<T>): T {
    const dependencies = this.extractDependencies(constructor);
    const resolvedDependencies = this.resolveDependencies(dependencies);
    
    const instance = new constructor(...resolvedDependencies);
    
    this.injectProperties(instance, constructor);
    
    return instance;
  }

  private extractDependencies(constructor: Constructor): ServiceKey[] {
    const injectableMetadata = getInjectableMetadata(constructor);
    if (injectableMetadata?.dependencies) {
      return injectableMetadata.dependencies;
    }

    const injectMetadata = getInjectMetadata(constructor);
    const paramTypes = getParameterTypes(constructor);
    
    const dependencies: ServiceKey[] = [];
    
    for (let i = 0; i < paramTypes.length; i++) {
      const explicitInject = injectMetadata.find(meta => meta.index === i);
      if (explicitInject) {
        dependencies[i] = explicitInject.key;
      } else if (paramTypes[i]) {
        dependencies[i] = paramTypes[i];
      }
    }
    
    return dependencies;
  }

  private resolveDependencies(dependencies: ServiceKey[]): any[] {
    return dependencies.map(dep => this.resolve(dep));
  }

  private injectProperties(instance: any, constructor: Constructor): void {
    const propertyMetadata = getPropertyInjectMetadata(constructor.prototype);
    
    for (const [propertyKey, serviceKey] of Object.entries(propertyMetadata)) {
      const service = this.resolve(serviceKey);
      instance[propertyKey] = service;
    }
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

  private generateScopeId(): string {
    return `scope_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private log(message: string): void {
    if (this.config.enableLogging) {
    }
  }
}