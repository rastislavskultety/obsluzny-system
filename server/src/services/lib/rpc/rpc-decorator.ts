export function rpc(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  if (typeof descriptor.value === 'function') {
    target.$rpc = target.$rpc || [];
    target.$rpc.push(propertyKey);
  } else throw new Error('remote decorator supports only class methods');
};

