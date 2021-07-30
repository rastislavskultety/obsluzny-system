import { IReplyCallback, ITransportChannel, Transport } from './transport';
import { Worker, MessagePort } from 'worker_threads';
import debug from 'debug';

const log = debug('channel');

class MessagePortChannel implements ITransportChannel {
  constructor(private messagePort: MessagePort) { }

  on(eventName: 'close', callback: () => void): void;
  on(eventName: 'message', callback: (reply: IReplyCallback, ...args: any) => void): void;
  on(eventName: string, callback: (...args: any) => void): void {
    log('on %s', eventName);
    switch (eventName) {
      case 'message':
        const reply = (...args: any) => this.send(...args);
        this.messagePort.on('message', (value: any[]) => {
          log('received message from messagePort value=%o', value);
          callback(reply, ...value);
        });
        break;

      case 'close':
        this.messagePort.on('close', callback);
        break;

      default:
        throw new Error('Invalid event name ' + eventName);
    }
  }

  send(...args: any): void {
    log('sending message to messagePort args=%o', [...args]);
    setImmediate(() => this.messagePort.postMessage([...args]));
  }

  close(): void {
    log('closing messagePort');
    setImmediate(() => this.messagePort.close());
  }
}


class WorkerChannel implements ITransportChannel {
  constructor(private worker: Worker) { }

  on(eventName: 'close', callback: () => void): void;
  on(eventName: 'message', callback: (reply: IReplyCallback, ...args: any) => void): void;
  on(eventName: string, callback: (...args: any) => void): void {
    switch (eventName) {
      case 'message':
        const reply = (...args: any) => this.send(...args);
        this.worker.on('message', (value: any[]) => {
          log('received message from worker value=%o', value);
          callback(reply, ...value);
        });
        break;

      case 'close':
        this.worker.on('exit', callback);
        break;

      default:
        throw new Error('Invalid event name ' + eventName);
    }
  }

  send(...args: any): void {
    log('sending message to worker args=%o', [...args]);
    this.worker.postMessage([...args]);
  }

  close(): void {
    log('terminating worker')
    setImmediate(() => this.worker.terminate());
  }
}

export function createMessagePortTransport(messagePort: MessagePort): Transport {
  return new Transport(new MessagePortChannel(messagePort));
}

export function createWorkerTransport(worker: Worker): Transport {
  return new Transport(new WorkerChannel(worker));
}


