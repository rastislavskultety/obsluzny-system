import { Transport } from '../transport';
import { Worker, MessagePort } from 'worker_threads';
import { MessagePortChannel } from './message-port-channel';
import { WorkerChannel } from './worker-channel';

export function createMessagePortTransport(messagePort: MessagePort): Transport {
  return new Transport(new MessagePortChannel(messagePort));
}

export function createWorkerTransport(worker: Worker): Transport {
  return new Transport(new WorkerChannel(worker));
}
