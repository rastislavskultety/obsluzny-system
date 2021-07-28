
import { ServiceCenter } from "../service";
import { Queue } from '../lib/queue';
import { workerData, parentPort, isMainThread } from "worker_threads";
import { RPCServer } from "../lib/rpc";
import { createMessagePortTransport } from "../lib/transport/worker-thread-transport";

if (isMainThread) {
  // tslint:disable-next-line:no-console
  console.error('Queue worker thread: cannot be run as main thread');
  process.exit(2);
}

if (typeof workerData.id !== 'number') {
  // tslint:disable-next-line:no-console
  console.error('Queue worker thread: missing or invalid queue id');
  process.exit(2)
}

const server = new RPCServer(createMessagePortTransport(parentPort!));
const queue = new Queue(workerData.id, new ServiceCenter());
server.registerObjectMethods(queue);
