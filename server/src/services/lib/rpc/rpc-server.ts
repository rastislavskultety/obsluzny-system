import { Transport } from '../transport/transport';

export class RPCServer {
  private methods: { [index: string]: (...args: any) => Promise<any> } = {};

  constructor(transport: Transport) {
    transport.onMessage((method: string, ...args: any): Promise<any> => {
      const fn = this.methods[method];
      if (fn)
        return fn(...args);
      else
        throw new Error('Invalid method ' + method);
    });
  }

  register(method: string, fn: (...args: any) => Promise<any>): void {
    if (this.methods[method]) throw new Error(`Method ${method} is already registered`);
    this.methods[method] = fn;
  }

  registerObjectMethods(object: object): void {
    const rpcMethods = object.constructor.prototype.$rpc;

    if (!rpcMethods || !Array.isArray(rpcMethods) || rpcMethods.length === 0) {
      throw new Error('There are no rpc methods on ' + object.constructor.name);
    }

    rpcMethods.forEach((method: string) => {
      this.register(method, async (...args: any): Promise<any> => (object as any)[method](...args))
    });
  }
}

