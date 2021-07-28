/*
 * Server je objekt ktorý poskytuje business logiku a podporné služby pre api
 */

import { QueuePool } from "./lib/queue-pool";
import { QueueStats } from "./lib/queue";
import { getConfiguration, ServiceConfiguration, setConfiguration } from "./lib/service-configuration";
import { createSessionStore, SessionData } from "./session";
import { ServiceQueue } from "./service";
import { SessionStore } from "./lib/session-store";
import { Worker } from 'worker_threads';
import { createWorkerTransport } from "./lib/transport/worker-thread-transport";
import { RemoteQueue } from "./lib/remote-queue";
import { RPCClient } from "./lib/rpc";
import path from 'path';

/*
 * Servisné stredisko simuluje spracovanie požiadavok užívateľov.
 *
 * Táto implementácia vytvára službu ktorá vracia citáty známych osobnosti ktoré
 * sú náhodne vybrané z databázy.
 *
 * Všetky servisné centrá sú simulované jedným objektom.
 */
// const serviceCenter = new ServiceCenter();

/*
 * Factory pre vytvárnie frontov požiadaviek pre jednotlivé strediská
 *
 * Každá fronta je identifikovaná parametrom id, čo je celé číslo.
 */
function queueFactory(id: number): ServiceQueue {

  const worker = new Worker(path.resolve(__dirname, './workers/queue.js'), { workerData: { id } });
  const rpcClient = new RPCClient(createWorkerTransport(worker));
  return new RemoteQueue(id, rpcClient);
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

/*
 * Server pre aplikačnú logiku
 */
export class Server {
  private _queuePool = new QueuePool<ServiceQueue>(queueFactory);
  private _sessionStore = createSessionStore();

  /*
   * queuePool menežuje fronty požiadaviek a prideľuje fronty podľa
   * aktuálnej obsadenosti všetkých frontov.
   */
  queuePool(): QueuePool<ServiceQueue> {
    return this._queuePool;
  }

  /*
   * sessionStore umožňuje menežovanie aktuálnych relácií (sessions) užívateľov.
   */
  sessionStore(): SessionStore<SessionData> {
    return this._sessionStore;
  }

  /*
   * Získanie konfigurácie služieb (parametrov n, m, t, r zo zadania).
   *
   * Tieto parametre je možné dynamicky meniť počas prevádzky servera pomocou rest api.
   */
  async getServiceConfiguration(): Promise<ServiceConfiguration> {
    return await getConfiguration();
  }

  /*
   * Nastavenie novej konfigurácie služieb
   */
  async setServiceConfiguration(conf: ServiceConfiguration) {
    return await setConfiguration(conf);
  }

  /*
   * Monitorovanie servera - získanie aktuálnych informácií.
   */
  async getStats(): Promise<ServerStats> {
    const activeUsers = await this._sessionStore.count();
    const numberOfQueues = await this._queuePool.count();

    let queuedRequests = 0;
    let completedRequests = 0;
    let rejectedRequests = 0;
    let serviceBusyTime = 0;
    let serviceIdleTime = 0;
    let totalWaitTime = 0;

    const arr: Promise<QueueStats>[] = [];

    this._queuePool.forEachQueue((queue: ServiceQueue) => arr.push(queue.getStats()));

    const queueStats = await Promise.all(arr);
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
    this._queuePool.forEachQueue((queue: ServiceQueue) => arr.push(queue.resetStats()));
    await Promise.all(arr);
  }
}

export default Server;
