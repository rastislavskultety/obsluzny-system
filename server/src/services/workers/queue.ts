import debug from 'debug';
import { Queue } from '../lib/queues';
import { workerData, isMainThread, parentPort } from "worker_threads";
import { RPCClient, RPCServer } from "../lib/rpc";
import { createClientSocketTransport, createServerSocketTransport } from "../lib/transport/socket-transport";
import { RemoteServiceCenter } from '../lib/remote-service-center';
import { signalReady, validateWorker } from '../lib/worker-helpers';

const THREAD_NAME = 'Queue worker thread';
const debugWorker = debug('worker');

debugWorker('%s started with data = %o', THREAD_NAME, workerData);

validateWorker(THREAD_NAME, {
  'id': 'number',
  'serviceCenterName': 'string'
});

const serverTransport = createServerSocketTransport('queue' + workerData.id);
const serverRpc = new RPCServer(serverTransport);

const serviceTransport = createClientSocketTransport(workerData.serviceCenterName, 'queue_service_' + workerData.id);
const serviceRpc = new RPCClient(serviceTransport);

const queue = new Queue(workerData.id, new RemoteServiceCenter(serviceRpc));

serverRpc.registerObjectMethods(queue);

serverTransport.on('close', () => {
  serviceTransport.close();
  setImmediate(() => process.exit());
});

signalReady(serverTransport.waitReady(), serviceTransport.waitReady());

