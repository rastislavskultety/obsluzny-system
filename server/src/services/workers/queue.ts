
import { ServiceCenter } from "../service";
import { Queue } from '../lib/queue';
import { workerData, parentPort, isMainThread } from "worker_threads";
import { RPCServer } from "../lib/rpc";
import { SocketServer } from "../lib/socket";
import { createSocketTransport } from "../lib/transport/socket-transport";

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

if (typeof workerData.socketPath !== 'string') {
  // tslint:disable-next-line:no-console
  console.error('Queue worker thread: missing or invalid socketPath');
  process.exit(2)
}

const socket = new SocketServer(workerData.socketPath);
const server = new RPCServer(createSocketTransport(socket));
const queue = new Queue(workerData.id, new ServiceCenter());

server.registerObjectMethods(queue);
