import { Transport } from '../transport/transport';
import debug from 'debug';
import { getRpcDecoratedMethods } from './rpc-decorator';

const debugRpc = debug('rpc');

export class RPCServer {
  private methods: { [index: string]: (...args: any[]) => Promise<any> } = {};

  constructor(private transport: Transport) {
    transport.on('message', async (reply, method: string, ...args: any[]) => {
      debugRpc('rpc server received call to %o with args: %o', method, [...args]);

      const fn = this.methods[method];
      if (fn)
        try {
          const result = await fn(...args);
          debugRpc('rpc server sending reply to call %s: %o', method, result);
          reply(null, result);
        } catch (error) {
          debugRpc('rpc server sending error to call %s: %o', method, error);
          reply(error);
        }
      else
        reply(new Error('Invalid method ' + method));
    });
  }

  register(method: string, fn: (...args: any[]) => Promise<any>): void {
    if (this.methods[method]) throw new Error(`Method ${method} is already registered`);
    this.methods[method] = fn;
  }

  registerObjectMethods(obj: object, rpcMethods?: string[]): void {
    rpcMethods = rpcMethods || getRpcDecoratedMethods(obj);

    if (Array.isArray(rpcMethods) && rpcMethods.length > 0) {
      rpcMethods.forEach((method: string) => {
        this.register(method, async (...args: any[]): Promise<any> => (obj as any)[method](...args))
      });
    } else {
      throw new Error('There are no rpc methods on ' + obj.constructor.name);
    }
  }

  close() {
    this.transport.close();
  }
}

