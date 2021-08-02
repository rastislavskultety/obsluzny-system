import { IReplyCallback, ITransportChannel, Transport } from '../transport';
import { Worker, MessagePort } from 'worker_threads';
import debug from 'debug';

const debugChannel = debug('channel');

export class WorkerChannel implements ITransportChannel {
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


