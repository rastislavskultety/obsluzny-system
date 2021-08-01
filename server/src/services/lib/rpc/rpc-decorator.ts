
/*
 * Dekorátor pre označenie metód ktoré budú zahrnuté do rpc servera
 */
export function rpc(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  if (typeof descriptor.value === 'function') {
    if (!target.hasOwnProperty('$rpc')) {
      Object.defineProperty(target, '$rpc', {
        'value': []
      });
    }
    target.$rpc.push(propertyKey);
  } else {
    throw new Error('remote decorator supports only class methods');
  }
};

/*
 * Získanie zoznamu metód označených dekorátorom @rpc, vrátane všetkých rodičovských tried
 */
export function getRpcDecoratedMethods(obj: object) {
  let methods: string[] = [];
  let proto = obj.constructor.prototype;
  while (proto) {
    if (Array.isArray(proto.$rpc)) {
      methods = methods.concat(proto.$rpc);
    }
    proto = Object.getPrototypeOf(proto);
  }
  return methods;
}

