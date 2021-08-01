import { IQueue } from './interfaces';
import { QueueStats } from './queue';
import { RPCClient } from '../rpc';


export class RemoteQueue<Request, Response> implements IQueue<Request, Response>{

  constructor(public id: number, private rpc: RPCClient) { }

  // /*
  //  * Zničenie fronty
  //  *
  //  * V odvodených triedach by tu mohlo byť vymazanie perzistných informácií (napr. z redis databázy)
  //  */
  async destroy() {
    console.log('destroy remote queue')
    this.rpc.close();
  }

  /*
   * Pridanie požiadavky do fronty.
   *
   * Kapacita fronty sa môže  meniť zmenou dynamickou zmenou konfigurácie servera.
   */
  async enqueue(request: Request, capacity: number): Promise<Response> {
    return this.rpc.call('enqueue', request, capacity);
  }

  /*
   * Dĺžka fronty
   *
   * Poznámka: asynchronnosť je tu pre budúce rozšírenia triedy
   */
  async length(): Promise<number> {
    return this.rpc.call('length');
  }

  /*
   * Získanie monitorovacích údajov fronty
   *
   * Poznámka: asynchronnosť je tu pre budúce rozšírenia triedy
   */
  async getStats(): Promise<QueueStats> {
    return this.rpc.call('getStats');
  }

  /*
   * Vynulovanie monitorovacích údajov fronty
   *
   * Poznámka: asynchronnosť je tu pre budúce rozšírenia triedy
   */
  async resetStats(): Promise<void> {
    return this.rpc.call('resetStats');
  }
}

