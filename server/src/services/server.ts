/*
 * Server je objekt ktorý poskytuje business logiku a podporné služby pre api
 */

import path from 'path';
import { QueuePool } from "./lib/queue-pool";
import { QueueStats } from "./lib/queue";
import { ServiceConfigurationStore } from "./lib/service-configuration";
import { createSessionStore, SessionData } from "./session";
import { ServiceQueue } from "./lib/service-center";
import { RemoteQueue } from "./lib/remote-queue";
import { RPCClient } from "./lib/rpc";
import { createClientSocketTransport } from "./lib/transport/socket-transport";
import { createWorkerThread } from './lib/worker-helpers';
import { RedisStore } from './lib/redis-store';
import configuration from '../configuration';

/*
 * Servisné stredisko simuluje spracovanie požiadavok užívateľov.
 *
 * Táto implementácia vytvára službu ktorá vracia citáty známych osobnosti ktoré
 * sú náhodne vybrané z databázy.
 *
 * Všetky servisné centrá sú simulované jedným objektom.
 */


const workers = {
  queue: path.resolve(__dirname, './workers/queue.js'),
  service: path.resolve(__dirname, './workers/service.js'),
}

/*
 * Factory pre vytvárnie frontov požiadaviek pre jednotlivé strediská
 *
 * Každá fronta je identifikovaná parametrom id, čo je celé číslo.
 */
function createQueueFactory(serviceCenterName: string) {
  return async (id: number): Promise<ServiceQueue> => {
    await createWorkerThread(workers.queue, { id, serviceCenterName, configuration });
    const rpcClient = new RPCClient(createClientSocketTransport('queue' + id, 'queue_client_' + id));
    return new RemoteQueue(id, rpcClient);
  }
}

function startServiceCenter(serviceCenterName: string) {
  createWorkerThread(workers.service, { serviceCenterName, configuration });
}

/*
 * Monitorovacie údaje servera
 */
export interface ServerStats {
  activeUsers: number, // počet aktívnych užívateľov
  numberOfQueues: number, // počet aktívnych front
  queuedRequests: number, // počet čakajúcich požiadaviek
  completedRequests: number, // celkový počet vybavených požiadaviek
  rejectedRequests: number, // celkový počet zamietnutých požiadaviek z dôvodu naplnenia kapacity front
  serviceUtilization: number, // celkové využitie servisných stredísk (doba obsadenia stredísk / celková doba prevádzky)
  avgWaitingTime: number // priemerný čas čakania požiadaviek na vybavenie (čakanie vo fronte + čakanie na vybavenie)
}

const SERVICE_CENTER_NAME = 'service';

/*
 * Server pre aplikačnú logiku
 */
export class Server {
  private redisStore = new RedisStore(configuration.redis);
  /*
   * queuePool menežuje fronty požiadaviek a prideľuje fronty podľa
   * aktuálnej obsadenosti všetkých frontov.
   */
  readonly queuePool = new QueuePool<ServiceQueue>(createQueueFactory(SERVICE_CENTER_NAME));

  /*
   * sessionStore umožňuje menežovanie aktuálnych relácií (sessions) užívateľov.
   */
  readonly sessionStore = createSessionStore(this.redisStore);

  /*
   * serviceConfigurationStore ukladá aktuálnu konfiguráciu servisných centier
   */
  readonly serviceConfigurationStore = new ServiceConfigurationStore(new RedisStore(configuration.redis));

  constructor() {
    this.serviceConfigurationStore.set(configuration.service);
    startServiceCenter(SERVICE_CENTER_NAME);
  }

  /*
   * Monitorovanie servera - získanie aktuálnych informácií.
   */
  async getStats(): Promise<ServerStats> {
    const activeUsers = await this.sessionStore.count();
    const numberOfQueues = await this.queuePool.count();

    let queuedRequests = 0;
    let completedRequests = 0;
    let rejectedRequests = 0;
    let serviceBusyTime = 0;
    let serviceIdleTime = 0;
    let totalWaitTime = 0;

    const arr: Promise<QueueStats>[] = [];

    console.log('calling forEachQueue');
    await this.queuePool.forEachQueue((queue: ServiceQueue) => arr.push(queue.getStats()));

    const queueStats = await Promise.all(arr);
    console.log('queueStats', queueStats);
    queueStats.forEach(stats => {
      queuedRequests += stats.queuedRequests;
      completedRequests += stats.completedRequests;
      rejectedRequests += stats.rejectedRequests;
      serviceBusyTime += stats.serviceBusyTime;
      serviceIdleTime += stats.serviceIdleTime;
      totalWaitTime += stats.totalWaitTime;
    });

    const totalTime = serviceBusyTime + serviceIdleTime;
    const serviceUtilization = totalTime ? (serviceBusyTime / totalTime) : 0;
    const avgWaitingTime = completedRequests ? (totalWaitTime / completedRequests / 1000) : 0;

    return {
      activeUsers,
      numberOfQueues,
      queuedRequests,
      completedRequests,
      rejectedRequests,
      serviceUtilization,
      avgWaitingTime
    }
  }

  /*
   * Vynulovanie monitorovacích údajov
   */
  async resetStats() {
    const arr: Promise<void>[] = [];
    this.queuePool.forEachQueue((queue: ServiceQueue) => arr.push(queue.resetStats()));
    await Promise.all(arr);
  }
}

export default Server;
