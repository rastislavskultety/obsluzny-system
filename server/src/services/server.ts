/*
 * Server je objekt ktorý poskytuje business logiku a podporné služby pre api
 */

import { RemotePool } from "./lib/queues";
import { ServiceConfigurationStore } from "./lib/service-configuration";
import { createSessionStore, SessionData } from "./session";
import { ServiceRequest, ServiceResponse } from "./lib/service-center";
import { createClientSocketTransport } from "./lib/transport";
import { RedisStore } from './lib/redis-store';
import { POOL_SOCKET_NAME } from './workers';
import { RPCClient } from "./lib/rpc";
import { SessionStore } from './lib/session-store';

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
  private redisStore: RedisStore;

  /*
   * sessionStore umožňuje menežovanie aktuálnych relácií (sessions) užívateľov.
   */
  readonly sessionStore: SessionStore<SessionData>;

  /*
   * queuePool menežuje fronty požiadaviek a prideľuje fronty podľa
   * aktuálnej obsadenosti všetkých frontov.
   */
  readonly pool = new RemotePool<ServiceRequest, ServiceResponse>(new RPCClient(
    createClientSocketTransport(POOL_SOCKET_NAME, 'pool_client_' + process.pid))
  );

  /*
   * serviceConfigurationStore ukladá aktuálnu konfiguráciu servisných centier
   */
  readonly serviceConfigurationStore: ServiceConfigurationStore;

  constructor(configuration: any) {
    this.redisStore = new RedisStore(configuration.redis);

    // Vymazanie všetkých dát z redisu
    this.redisStore.call('flushall');

    // Store pre sessions
    this.sessionStore = createSessionStore(this.redisStore);

    // Store pre konfigurácie
    this.serviceConfigurationStore = new ServiceConfigurationStore(this.redisStore);

    // Nastavenie počiatočnej konfigurácie servisných centier
    this.serviceConfigurationStore.set(configuration.service);
  }

  /*
   * Monitorovanie servera - získanie aktuálnych informácií.
   */
  async getStats(): Promise<ServerStats> {
    const activeUsers = await this.sessionStore.count();
    const numberOfQueues = await this.pool.count();

    const stats = await this.pool.getStats();

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
    return this.pool.resetStats();
  }
}

export default Server;
