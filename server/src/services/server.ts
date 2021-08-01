/*
 * Server je objekt ktorý poskytuje business logiku a podporné služby pre api
 */

import configuration from '../configuration';
import { RemotePool } from "./lib/queues";
import { ServiceConfigurationStore } from "./lib/service-configuration";
import { createSessionStore } from "./session";
import { ServiceRequest, ServiceResponse } from "./lib/service-center";
import { createClientSocketTransport } from "./lib/transport/socket-transport";
import { createWorkerThread } from './lib/worker-helpers';
import { RedisStore } from './lib/redis-store';
import { workers } from './workers';
import { Worker } from 'worker_threads';
import { RPCClient } from "./lib/rpc";

/*
 * Servisné stredisko simuluje spracovanie požiadavok užívateľov.
 *
 * Táto implementácia vytvára službu ktorá vracia citáty známych osobnosti ktoré
 * sú náhodne vybrané z databázy.
 *
 * Všetky servisné centrá sú simulované jedným objektom.
 */

function startServiceCenterThread(serviceCenterName: string): Promise<Worker> {
  return createWorkerThread(workers.service, { serviceCenterName, configuration });
}

function startPoolThread(poolName: string, serviceCenterName: string): Promise<Worker> {
  return createWorkerThread(workers.pool, { poolName, serviceCenterName, configuration });
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

const SERVICE_CENTER_SOCKET_NAME = 'service';
const POOL_SOCKET_NAME = 'pool';

/*
 * Server pre aplikačnú logiku
 */
export class Server {
  private redisStore = new RedisStore(configuration.redis);

  /*
   * sessionStore umožňuje menežovanie aktuálnych relácií (sessions) užívateľov.
   */
  readonly sessionStore = createSessionStore(this.redisStore);

  /*
   * queuePool menežuje fronty požiadaviek a prideľuje fronty podľa
   * aktuálnej obsadenosti všetkých frontov.
   */
  readonly queuePool = new RemotePool<ServiceRequest, ServiceResponse>(new RPCClient(
    createClientSocketTransport(POOL_SOCKET_NAME, 'pool_client_' + process.pid))
  );

  /*
   * serviceConfigurationStore ukladá aktuálnu konfiguráciu servisných centier
   */
  readonly serviceConfigurationStore = new ServiceConfigurationStore(new RedisStore(configuration.redis));

  constructor() {
    // Nastavenie počiatočnej konfigurácie servisných centier
    this.serviceConfigurationStore.set(configuration.service);

    // Spusti obslužné thready
    startServiceCenterThread(SERVICE_CENTER_SOCKET_NAME);
    startPoolThread(POOL_SOCKET_NAME, SERVICE_CENTER_SOCKET_NAME);
  }

  /*
   * Monitorovanie servera - získanie aktuálnych informácií.
   */
  async getStats(): Promise<ServerStats> {
    const activeUsers = await this.sessionStore.count();
    const numberOfQueues = await this.queuePool.count();

    const stats = await this.queuePool.getStats();

    const queuedRequests = stats.queuedRequests;
    const completedRequests = stats.completedRequests;
    const rejectedRequests = stats.rejectedRequests;
    const serviceBusyTime = stats.serviceBusyTime;
    const serviceIdleTime = stats.serviceIdleTime;
    const totalWaitTime = stats.totalWaitTime;

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
  resetStats(): Promise<void> {
    return this.queuePool.resetStats();
  }
}

export default Server;
