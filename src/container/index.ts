export * from './types';
export * from './decorators';
export * from './DIContainer';
export * from './ServiceFactory';
export * from './DIExtensions';
export * from './ExpressIntegration';

import { DIContainer } from './DIContainer';
import { ServiceLifetime } from './types';

export const globalContainer = new DIContainer({
  enableAutoDiscovery: true,
  enableCircularDependencyDetection: true,
  enableLogging: process.env.NODE_ENV === 'development',
  defaultLifetime: ServiceLifetime.TRANSIENT
});

export class ContainerBuilder {
  private container: DIContainer;

  constructor() {
    this.container = new DIContainer();
  }

  withAutoDiscovery(): this {
    return this;
  }

  withCircularDependencyDetection(): this {
    return this;
  }

  withLogging(): this {
    return this;
  }

  withDefaultLifetime(lifetime: ServiceLifetime): this {
    return this;
  }

  build(): DIContainer {
    return this.container;
  }

  getContainer(): DIContainer {
    return this.container;
  }
}

export function createContainer(): ContainerBuilder {
  return new ContainerBuilder();
}

export function getDefaultContainer(): DIContainer {
  return globalContainer;
}