import { Transport } from '../transport/transport';

export class RPCClient {
  constructor(private transport: Transport) { }
  call(method: string, ...args: any): Promise<any> {
    return this.transport.send(method, ...args);
  }
  close() {
    this.transport.close();
  }
}
