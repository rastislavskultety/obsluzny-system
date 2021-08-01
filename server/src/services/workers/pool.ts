import debug from 'debug';
import { workerData } from "worker_threads";
import { RPCClient, RPCServer } from "../lib/rpc";
import { createClientSocketTransport, createServerSocketTransport } from "../lib/transport/socket-transport";
import { createWorkerThread, signalReady, validateWorker } from '../lib/worker-helpers';
import { Pool, RemoteQueue } from '../lib/queues';
import { RedisStore } from '../lib/redis-store';
import { ServiceConfigurationStore } from '../lib/service-configuration';
import { ServiceQueue } from '../lib/service-center';
import { workers } from '.';

const THREAD_NAME = 'Pool worker thread';
const debugWorker = debug('worker');

debugWorker('%s started with data = %o', THREAD_NAME, workerData);

validateWorker(THREAD_NAME, {
  'configuration': 'object',
  'poolName': 'string',
  'serviceCenterName': 'string'
});


const config = workerData.configuration;

const serverTransport = createServerSocketTransport(workerData.poolName);
const serverRpc = new RPCServer(serverTransport);


const redisStore = new RedisStore(config.redis);
const configStore = new ServiceConfigurationStore(redisStore);

const pool = new Pool(createQueueFactory(workerData.serviceCenterName), configStore);

serverRpc.registerObjectMethods(pool);

signalReady(serverTransport.waitReady());

/*
 * Factory pre vytvárnie frontov požiadaviek pre jednotlivé strediská
 *
 * Každá fronta je identifikovaná parametrom id, čo je celé číslo.
 */
function createQueueFactory(serviceCenterName: string) {
  return async (id: number): Promise<ServiceQueue> => {
    await createWorkerThread(workers.queue, { id, serviceCenterName, config });
    const rpcClient = new RPCClient(createClientSocketTransport('queue' + id, 'queue_client_' + id));
    return new RemoteQueue(id, rpcClient);
  }
}
