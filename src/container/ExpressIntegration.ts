import { Request, Response, NextFunction } from 'express';
import { DIContainer } from './DIContainer';
import { ServiceKey } from './types';

declare global {
  namespace Express {
    interface Request {
      container: DIContainer;
      services: ServiceResolver;
    }
  }
}

export class ServiceResolver {
  constructor(private container: DIContainer) {}

  get<T>(key: ServiceKey<T>): T {
    return this.container.resolve(key);
  }

  tryGet<T>(key: ServiceKey<T>): T | undefined {
    return this.container.tryResolve(key);
  }

  getMany<T>(keys: ServiceKey<T>[]): T[] {
    return this.container.resolveMultiple(keys);
  }
}

export class DIMiddleware {
  
  static create(container: DIContainer) {
    return (req: Request, res: Response, next: NextFunction) => {
      const scope = container.createScope(`request_${Date.now()}`);
      
      container.registerInstance('Request', req);
      container.registerInstance('Response', res);
      
      req.container = container;
      req.services = new ServiceResolver(container);
      
      container.executeInScope(scope, () => {
        next();
      });
    };
  }

  static injectServices<T extends Record<string, ServiceKey>>(services: T) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.container) {
        throw new Error('DI container not found in request. Make sure DIMiddleware.create() is used first.');
      }

      const resolvedServices: Record<string, any> = {};
      
      Object.entries(services).forEach(([name, key]) => {
        resolvedServices[name] = req.container.resolve(key);
      });

      (req as any).injectedServices = resolvedServices;
      
      next();
    };
  }

  static lazy<T>(serviceKey: ServiceKey<T>, propertyName: string = 'lazyService') {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.container) {
        throw new Error('DI container not found in request.');
      }

      let service: T | undefined;
      
      Object.defineProperty(req, propertyName, {
        get: () => {
          if (!service) {
            service = req.container.resolve(serviceKey);
          }
          return service;
        },
        configurable: true
      });

      next();
    };
  }
}

export class ControllerFactory {
  constructor(private container: DIContainer) {}

  createController<T>(controllerClass: new (...args: any[]) => T): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const container = req.container || this.container;
        
        if (!container.isRegistered('Request')) {
          container.registerInstance('Request', req);
        }
        if (!container.isRegistered('Response')) {
          container.registerInstance('Response', res);
        }

        const controller = container.resolve(controllerClass as ServiceKey<T>);
        
        if (typeof (controller as any).action === 'function') {
          await (controller as any).action();
        }
        
      } catch (error) {
        next(error);
      }
    };
  }

  createHandler<T>(
    serviceKey: ServiceKey<T>,
    method: keyof T
  ): (req: Request, res: Response, next: NextFunction) => Promise<void> {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const container = req.container || this.container;
        const service = container.resolve(serviceKey);
        
        const methodFn = (service as any)[method];
        if (typeof methodFn !== 'function') {
          throw new Error(`Method ${String(method)} not found on service`);
        }

        await methodFn.call(service, req, res, next);
        
      } catch (error) {
        next(error);
      }
    };
  }
}

export function InjectIntoRoute(serviceKey: ServiceKey, propertyName?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
      try {
        if (!req.container) {
          throw new Error('DI container not found in request');
        }

        const service = req.container.resolve(serviceKey);
        
        if (propertyName) {
          (this as any)[propertyName] = service;
        }

        return await originalMethod.call(this, service, req, res, next);
        
      } catch (error) {
        next(error);
      }
    };

    return descriptor;
  };
}

export class ServiceLocator {
  private static instance: ServiceLocator;
  private container?: DIContainer;

  private constructor() {}

  static getInstance(): ServiceLocator {
    if (!ServiceLocator.instance) {
      ServiceLocator.instance = new ServiceLocator();
    }
    return ServiceLocator.instance;
  }

  setContainer(container: DIContainer): void {
    this.container = container;
  }

  get<T>(key: ServiceKey<T>): T {
    if (!this.container) {
      throw new Error('Container not initialized in ServiceLocator');
    }
    return this.container.resolve(key);
  }

  tryGet<T>(key: ServiceKey<T>): T | undefined {
    if (!this.container) {
      return undefined;
    }
    return this.container.tryResolve(key);
  }
}