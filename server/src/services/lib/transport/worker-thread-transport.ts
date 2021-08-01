import { IReplyCallback, ITransportChannel, Transport } from './transport';
import { Worker, MessagePort } from 'worker_threads';
import debug from 'debug';

const debugChannel = debug('channel');

class MessagePortChannel implements ITransportChannel {
  constructor(private messagePort: MessagePort) { }

  on(eventName: 'close' | 'ready', callback: () => void): this;
  on(eventName: 'message', callback: (reply: IReplyCallback, ...args: any[]) => void): this;
  on(eventName: string, callback: (...args: any[]) => void): this {
    debugChannel('on %s', eventName);
    switch (eventName) {
      case 'message':
        const reply = (...args: any[]) => this.send(...args);
        this.messagePort.on('message', (value: any[]) => {
          debugChannel('received message from messagePort value=%o', value);
          callback(reply, ...value);
        });
        break;

      case 'close':
      case 'ready':
        this.messagePort.on('close', callback);
        break;

      default:
        throw new Error('Invalid event name ' + eventName);
    }
    return this;
  }

  send(...args: any[]): void {
    debugChannel('sending message to messagePort args=%o', [...args]);
    this.messagePort.postMessage([...args]);
  }

  close(): void {
    debugChannel('closing messagePort');
    this.messagePort.close();
  }

  isReady(): boolean {
    return true;
  }
}


class WorkerChannel implements ITransportChannel {
  constructor(private worker: Worker) { }

  on(eventName: 'close' | 'ready', callback: () => void): this;
  on(eventName: 'message', callback: (reply: IReplyCallback, ...args: any[]) => void): this;
  on(eventName: string, callback: (...args: any[]) => void): this {
    switch (eventName) {
      case 'message':
        const reply = (...args: any[]) => this.send(...args);
        this.worker.on('message', (value: any[]) => {
          debugChannel('received message from worker value=%o', value);
          callback(reply, ...value);
        });
        break;

      case 'close':
      case 'ready':
        this.worker.on('exit', callback);
        break;

      default:
        throw new Error('Invalid event name ' + eventName);
    }
    return this;
  }

  send(...args: any[]): void {
    debugChannel('sending message to worker args=%o', [...args]);
    this.worker.postMessage([...args]);
  }

  close(): void {
    debugChannel('terminating worker')
    this.worker.terminate();
  }

  isReady(): boolean {
    return true;
  }
}

export function createMessagePortTransport(messagePort: MessagePort): Transport {
  return new Transport(new MessagePortChannel(messagePort));
}

export function createWorkerTransport(worker: Worker): Transport {
  return new Transport(new WorkerChannel(worker));
}


