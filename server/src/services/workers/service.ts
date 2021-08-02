
import debug from 'debug';
import { ServiceCenter } from "../lib/service-center";
import { parentPort, workerData } from "worker_threads";
import { RPCServer } from "../lib/rpc";
import { createServerSocketTransport } from "../lib/transport";
import { signalReady, validateWorker } from './lib/helpers';
import { RedisStore } from '../lib/redis-store';
import { ServiceConfigurationStore } from '../lib/service-configuration';

const THREAD_NAME = 'Service worker thread';
const debugWorker = debug('worker');

debugWorker('%s started', THREAD_NAME);

validateWorker(THREAD_NAME, {
  'serviceCenterName': 'string',
  'configuration': 'object',
});

const config = workerData.configuration;

const transport = createServerSocketTransport(workerData.serviceCenterName);
const server = new RPCServer(transport);

const redisStore = new RedisStore(config.redis);
const configStore = new ServiceConfigurationStore(redisStore);
const service = new ServiceCenter(configStore);

server.registerObjectMethods(service);

signalReady(transport.waitReady());

parentPort?.on('close', () => redisStore.call('quit'));
