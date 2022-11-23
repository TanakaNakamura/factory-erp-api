import 'reflect-metadata';
import {
  ServiceKey,
  Constructor,
  InjectableMetadata,
  InjectMetadata
} from './types';

export const INJECTABLE_METADATA_KEY = Symbol('injectable');
export const INJECT_METADATA_KEY = Symbol('inject');
export const PARAM_TYPES_METADATA_KEY = 'design:paramtypes';

export function Injectable(dependencies?: ServiceKey[]): ClassDecorator {
  return function (target: any) {
    const existingMetadata: InjectableMetadata = Reflect.getMetadata(INJECTABLE_METADATA_KEY, target) || {};
    
    const metadata: InjectableMetadata = {
      ...existingMetadata,
      dependencies: dependencies || existingMetadata.dependencies
    };
    
    Reflect.defineMetadata(INJECTABLE_METADATA_KEY, metadata, target);
    return target;
  };
}

export function Inject(key: ServiceKey): ParameterDecorator {
  return function (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) {
    const existingMetadata: InjectMetadata[] = Reflect.getMetadata(INJECT_METADATA_KEY, target) || [];
    
    existingMetadata.push({
      index: parameterIndex,
      key
    });
    
    Reflect.defineMetadata(INJECT_METADATA_KEY, existingMetadata, target);
  };
}

export function InjectProperty(key: ServiceKey): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const existingMetadata: { [key: string]: ServiceKey } = Reflect.getMetadata('inject:properties', target) || {};
    existingMetadata[propertyKey.toString()] = key;
    Reflect.defineMetadata('inject:properties', existingMetadata, target);
  };
}

export function getInjectableMetadata(target: Constructor): InjectableMetadata | undefined {
  return Reflect.getMetadata(INJECTABLE_METADATA_KEY, target);
}

export function getInjectMetadata(target: Constructor): InjectMetadata[] {
  return Reflect.getMetadata(INJECT_METADATA_KEY, target) || [];
}

export function getParameterTypes(target: Constructor): Constructor[] {
  return Reflect.getMetadata(PARAM_TYPES_METADATA_KEY, target) || [];
}

export function getPropertyInjectMetadata(target: any): { [key: string]: ServiceKey } {
  return Reflect.getMetadata('inject:properties', target) || {};
}