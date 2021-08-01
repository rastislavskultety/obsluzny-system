/*
 * QueuePool menežuje fronty a prideľuje ich novým požiadavkam.
 */

import debug from 'debug';
import { RPCClient } from '../rpc';
import { ResponseEnvelope } from './pool';
import { QueueStats } from './queue';

const debugPool = debug('pool');

/*
 * QueuePool menežuje fronty a prideľuje ich novým požiadavkam.
 */
export class RemotePool<Request, Response> {

  constructor(private rpc: RPCClient) { }

  enqueue(request: Request): Promise<ResponseEnvelope<Response>> {
    return this.rpc.call('enqueue', request);
  }

  getStats(): Promise<QueueStats> {
    return this.rpc.call('getStats');
  }

  resetStats(): Promise<void> {
    return this.rpc.call('resetStats')
  }

  count(): Promise<number> {
    return this.rpc.call('count');
  }
}
