import { IReplyCallback, ITransportChannel } from '../transport';
import { Worker, MessagePort } from 'worker_threads';
import debug from 'debug';

const debugChannel = debug('channel');

export class MessagePortChannel implements ITransportChannel {
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
