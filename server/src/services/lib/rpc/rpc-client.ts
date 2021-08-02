import { Transport } from '../transport/transport';
import debug from 'debug';

const debugRpc = debug('rpc');

export class RPCClient {
  constructor(private transport: Transport) { }
  call(method: string, ...args: any[]): Promise<any> {
    debugRpc('rpc client calling method %o with args: %o', method, [...args]);
    return this.transport.send(method, ...args);
  }
  close() {
    this.transport.close();
  }
}
