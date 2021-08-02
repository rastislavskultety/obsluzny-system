/*
 * QueuePool menežuje fronty a prideľuje ich novým požiadavkam.
 */

import debug from 'debug';
import { rpc } from '../rpc';
import { ServiceConfigurationStore } from '../service-configuration';
import { IQueue } from './interfaces';
import { QueueStats } from './queue';
import { QueueManager } from './queue-manager';

const debugPool = debug('pool');

/*
 * Definícia factory pre vytváranie nových front. Každá fronta je identifikovaná celým číslom.
 */
export type QueueFactory<Request, Response> = (id: number) => Promise<IQueue<Request, Response>>;

export interface ResponseEnvelope<Response> {
  response: Response;
  serviceCenter: number,
}
/*
 * QueuePool menežuje fronty a prideľuje ich novým požiadavkam.
 */
export class Pool<Request, Response> extends QueueManager<IQueue<Request, Response>> {

  private destroyedQueueStats: QueueStats = {
    queuedRequests: 0,
    completedRequests: 0,
    rejectedRequests: 0,
    serviceBusyTime: 0,
    serviceIdleTime: 0,
    totalWaitTime: 0,
  }

  constructor(
    queueFactory: QueueFactory<Request, Response>,
    private confStore: ServiceConfigurationStore) {
    super(queueFactory)
  }

  @rpc
  async enqueue(request: Request): Promise<ResponseEnvelope<Response>> {
    const config = await this.confStore.get();
    const queue = await this.allocateQueue(config.numberOfQueues);
    await this.destroyStaleQueues(config.numberOfQueues);
    const response = await queue.enqueue(request, config.queueCapacity);
    return {
      response,
      serviceCenter: queue.id + 1
    };
  }

  @rpc
  async destroy() {
    return this.destroyAllQueues();
  }

  @rpc
  async getStats(): Promise<QueueStats> {

    const acc: QueueStats = Object.assign({}, this.destroyedQueueStats);
    const queues = await this.getQueueList();

    const queueStats = await Promise.all(queues.map(queue => queue.getStats()));
    queueStats.forEach(stats => addStats(acc, stats));
    return acc;
  }

  @rpc
  async resetStats(): Promise<void> {
    resetStats(this.destroyedQueueStats);
    const queues = await this.getQueueList();
    await Promise.all(queues.map(queue => queue.resetStats()));
  }

  protected async destroyQueue(queue: IQueue<Request, Response>) {
    // pripočítaj štatistiky odstránenej fronty k štatistikám všetkých odstránených front
    const stats = await queue.getStats();
    addStats(this.destroyedQueueStats, stats);
    super.destroyQueue(queue)
  }
}


function resetStats(dest: QueueStats) {
  let key: keyof QueueStats;
  for (key in dest) {
    if (dest.hasOwnProperty(key)) dest[key] = 0;
  }
}

function addStats(dest: QueueStats, src: QueueStats) {
  let key: keyof QueueStats;
  for (key in src) {
    if (dest.hasOwnProperty(key)) dest[key] += src[key];
  }
}
