import { resolve } from "path";
import { Worker } from "worker_threads";
import { createWorkerThread } from "./lib/helpers";

/*
 * Konfigurácia názvov socketov
 */
export const SERVICE_CENTER_SOCKET_NAME = 'service';
export const POOL_SOCKET_NAME = 'pool';


/*
 * Mená súborov so zdrojovým kódom workerow
 */
export const workers = {
  queue: resolve(__dirname, './queue.js'),
  service: resolve(__dirname, './service.js'),
  pool: resolve(__dirname, './pool.js')
}

// Spusti obslužné thready
export async function startWorkerThreads(configuration: object) {
  await Promise.all([
    startServiceCenterThread(SERVICE_CENTER_SOCKET_NAME, configuration),
    startPoolThread(POOL_SOCKET_NAME, SERVICE_CENTER_SOCKET_NAME, configuration)
  ])
}

/*
 * Servisné stredisko simuluje spracovanie požiadavok užívateľov.
 *
 * Táto implementácia vytvára službu ktorá vracia citáty známych osobnosti ktoré
 * sú náhodne vybrané z databázy.
 *
 * Všetky servisné centrá sú simulované jedným objektom.
 */
function startServiceCenterThread(serviceCenterName: string, configuration: object): Promise<Worker> {
  return createWorkerThread(workers.service, { serviceCenterName, configuration });
}

/*
 * Pool menežuje všetky fronty a vytvára nové fronty
 */
function startPoolThread(poolName: string, serviceCenterName: string, configuration: object): Promise<Worker> {
  return createWorkerThread(workers.pool, { poolName, serviceCenterName, configuration });
}
