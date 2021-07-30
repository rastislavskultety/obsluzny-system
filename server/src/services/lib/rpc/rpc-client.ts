import { Transport } from '../transport/transport';
import debug from 'debug';

const log = debug('rpc');

export class RPCClient {
  constructor(private transport: Transport) { }
  call(method: string, ...args: any): Promise<any> {
    log('rpc client calling method %s with args: %o', method, [...args]);
    return this.transport.send(method, ...args);
  }
  close() {
    this.transport.close();
  }
}
