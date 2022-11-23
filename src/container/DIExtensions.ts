import { DIContainer } from './DIContainer';
import { ServiceLifetime, ServiceKey, Constructor } from './types';

export class DIContainerExtensions {
  
  static autoRegister(
    container: DIContainer,
    services: { [key: string]: Constructor },
    defaultLifetime: ServiceLifetime = ServiceLifetime.TRANSIENT
  ): void {
    Object.entries(services).forEach(([name, constructor]) => {
      container.register(name, constructor, defaultLifetime);
      container.register(constructor, constructor, defaultLifetime);
    });
  }

  static registerWithAutoDiscovery<T>(
    container: DIContainer,
    key: ServiceKey<T>,
    constructor: Constructor<T>,
    lifetime: ServiceLifetime = ServiceLifetime.TRANSIENT
  ): void {
    container.register(key, constructor, lifetime);
  }

  static registerIf<T>(
    container: DIContainer,
    condition: boolean,
    key: ServiceKey<T>,
    constructor: Constructor<T>,
    lifetime: ServiceLifetime = ServiceLifetime.TRANSIENT
  ): void {
    if (condition) {
      container.register(key, constructor, lifetime);
    }
  }

  static registerWithFallback<T>(
    container: DIContainer,
    key: ServiceKey<T>,
    primaryConstructor: Constructor<T>,
    fallbackConstructor: Constructor<T>,
    lifetime: ServiceLifetime = ServiceLifetime.TRANSIENT
  ): void {
    try {
      container.register(key, primaryConstructor, lifetime);
    } catch {
      container.register(key, fallbackConstructor, lifetime);
    }
  }

  static registerDecorator<T>(
    container: DIContainer,
    originalKey: ServiceKey<T>,
    decoratorKey: ServiceKey<T>,
    decoratorConstructor: Constructor<T>,
    lifetime: ServiceLifetime = ServiceLifetime.TRANSIENT
  ): void {
    if (!container.isRegistered(originalKey)) {
      throw new Error(`Original service ${originalKey.toString()} must be registered first`);
    }

    container.registerFactory(
      decoratorKey,
      (originalService: T) => {
        const decoratorInstance = Object.create(decoratorConstructor.prototype);
        decoratorConstructor.call(decoratorInstance, originalService);
        return decoratorInstance;
      },
      lifetime,
      [originalKey]
    );
  }

  static registerNamed<T>(
    container: DIContainer,
    baseName: string,
    implementations: { [name: string]: Constructor<T> },
    defaultLifetime: ServiceLifetime = ServiceLifetime.TRANSIENT
  ): void {
    Object.entries(implementations).forEach(([name, constructor]) => {
      const namedKey = `${baseName}:${name}`;
      container.register(namedKey, constructor, defaultLifetime);
    });
  }

  static createChild(parent: DIContainer): DIContainer {
    const child = new DIContainer();
    
    parent.getRegisteredKeys().forEach(key => {
      try {
        const service = parent.resolve(key as ServiceKey);
        child.registerInstance(key, service);
      } catch {
      }
    });

    return child;
  }

  static registerWithHooks<T>(
    container: DIContainer,
    key: ServiceKey<T>,
    constructor: Constructor<T>,
    hooks: {
      onCreate?: (instance: T) => void;
      onDestroy?: (instance: T) => void;
    },
    lifetime: ServiceLifetime = ServiceLifetime.TRANSIENT
  ): void {
    container.registerFactory(
      key,
      (...args: any[]) => {
        const instance = Object.create(constructor.prototype);
        constructor.apply(instance, args);
        
        if (hooks.onCreate) {
          hooks.onCreate(instance);
        }

        return instance;
      },
      lifetime
    );
  }

  static registerWithValidation<T>(
    container: DIContainer,
    key: ServiceKey<T>,
    constructor: Constructor<T>,
    validator: (instance: T) => boolean,
    lifetime: ServiceLifetime = ServiceLifetime.TRANSIENT
  ): void {
    container.registerFactory(
      key,
      (...args: any[]) => {
        const instance = Object.create(constructor.prototype);
        constructor.apply(instance, args);
        
        if (!validator(instance)) {
          throw new Error(`Service validation failed for ${key.toString()}`);
        }

        return instance;
      },
      lifetime
    );
  }
}

export abstract class DIModule {
  abstract register(container: DIContainer): void;
}

export class ModuleLoader {
  private modules: DIModule[] = [];

  addModule(module: DIModule): this {
    this.modules.push(module);
    return this;
  }

  loadInto(container: DIContainer): void {
    this.modules.forEach(module => {
      module.register(container);
    });
  }
}

export interface ContainerConfiguration {
  services: Array<{
    key: string;
    implementation: string;
    lifetime?: ServiceLifetime;
    dependencies?: string[];
  }>;
  modules?: string[];
}

export class ContainerConfigurator {
  static configureFromObject(
    container: DIContainer,
    config: ContainerConfiguration,
    serviceRegistry: { [key: string]: Constructor }
  ): void {
    config.services.forEach(serviceConfig => {
      const constructor = serviceRegistry[serviceConfig.implementation];
      if (!constructor) {
        throw new Error(`Service implementation not found: ${serviceConfig.implementation}`);
      }

      container.register(
        serviceConfig.key,
        constructor,
        serviceConfig.lifetime || ServiceLifetime.TRANSIENT
      );
    });
  }

  static configureFromJson(
    container: DIContainer,
    configJson: string,
    serviceRegistry: { [key: string]: Constructor }
  ): void {
    const config: ContainerConfiguration = JSON.parse(configJson);
    this.configureFromObject(container, config, serviceRegistry);
  }
}