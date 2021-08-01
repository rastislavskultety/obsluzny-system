export function createLogProxy<T>(target: T, log: any[]): T {
  const handler = {
    get: (target: { [index: string]: any }, key: string) => {
      if (typeof target[key] === 'function') {
        return (...args: any[]) => {
          log.push([target.constructor.name, key, ...args]);
          return target[key](...args);
        };
      }
      return target[key]
    }
  };
  return new Proxy(target, handler) as T;
}

export class Logger extends Array {
  select(...args: any) {
    let arr = [...args];
    return this.filter((logItem: any[]) => JSON.stringify(arr) === JSON.stringify(logItem.slice(0, arr.length)));
  }
}
