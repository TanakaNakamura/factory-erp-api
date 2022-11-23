export type Constructor<T = {}> = new (...args: any[]) => T;
export type Factory<T = any> = (...args: any[]) => T;
export type ServiceKey<T = any> = string | symbol | Constructor<T>;

export enum ServiceLifetime {
  TRANSIENT = 'transient',
  SINGLETON = 'singleton',
  SCOPED = 'scoped'
}

export interface ServiceDescriptor<T = any> {
  key: ServiceKey<T>;
  factory?: Factory<T>;
  constructor?: Constructor<T>;
  instance?: T;
  lifetime: ServiceLifetime;
  dependencies?: ServiceKey[];
}

export interface ConstructorServiceDescriptor<T = any> extends ServiceDescriptor<T> {
  constructor: Constructor<T>;
  factory?: never;
  instance?: never;
}

export interface FactoryServiceDescriptor<T = any> extends ServiceDescriptor<T> {
  factory: Factory<T>;
  constructor?: never;
  instance?: never;
}

export interface InstanceServiceDescriptor<T = any> extends ServiceDescriptor<T> {
  instance: T;
  constructor?: never;
  factory?: never;
}

export interface ServiceRegistry {
  [key: string]: ServiceDescriptor;
}

export interface DIScope {
  id: string;
  services: Map<string, any>;
  parent?: DIScope;
}

export interface InjectableMetadata {
  dependencies?: ServiceKey[];
}

export interface InjectMetadata {
  index: number;
  key: ServiceKey;
}

export interface DIContainerConfig {
  enableAutoDiscovery?: boolean;
  enableCircularDependencyDetection?: boolean;
  enableLogging?: boolean;
  defaultLifetime?: ServiceLifetime;
}

export class DIError extends Error {
  constructor(message: string, public readonly serviceKey?: ServiceKey) {
    super(message);
    this.name = 'DIError';
  }
}

export class CircularDependencyError extends DIError {
  constructor(path: ServiceKey[]) {
    super(`Circular dependency detected: ${path.map(k => k.toString()).join(' -> ')}`);
    this.name = 'CircularDependencyError';
  }
}

export class ServiceNotFoundError extends DIError {
  constructor(key: ServiceKey) {
    super(`Service not found: ${key.toString()}`);
    this.name = 'ServiceNotFoundError';
  }
}