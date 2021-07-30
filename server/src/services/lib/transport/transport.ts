import { EventEmitter } from 'events';
import debug from 'debug';

const log = debug('transport');

export type IReplyCallback = (value: any) => void;

export interface ITransportChannel {
  on(eventName: 'close', callback: () => void): void;
  on(eventName: 'message', callback: (reply: IReplyCallback, ...args: any) => void): void;
  send(...args: any): void;
  close(): void;
}

interface PendingResponse {
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

interface MessageEnvelope {
  type: string;
  id: number;
}

interface ReplyEnvelope extends MessageEnvelope {
  response: any;
}

interface ErrorEnvelope extends MessageEnvelope {
  error: any;
}

export class Transport extends EventEmitter {

  private sequentialId = 0;
  private pending = new Map<number, PendingResponse>();

  constructor(private channel: ITransportChannel) {
    super();
    this.initialize();
  }

  private initialize() {
    this.channel.on('message', (reply, env: MessageEnvelope | ReplyEnvelope | ErrorEnvelope, ...args: any) => {
      log('received message from channel: env=%o, args=%o', env, [...args]);

      const { id, type } = env;
      switch (type) {
        case 'message':
          this.emit('message', reply, id, ...args);
          break;
        case 'response':
          {
            const p = this.pending.get(id);
            this.pending.delete(id)
            if (typeof p === 'undefined') {
              throw new Error('Transport: invalid sequence id');
            } else {
              p.resolve((env as ReplyEnvelope).response);
            }
          }
          break;
        case 'error':
          {
            const p = this.pending.get(id);
            this.pending.delete(id)
            if (typeof p === 'undefined') {
              throw new Error('Transport: invalid sequence id');
            } else {
              p.reject((env as ErrorEnvelope).error);
            }
          }
          break;
        default:
          throw new Error('Invalid envelope type');
        //
      } // switch
    }); // onMessage

    this.channel.on('close', () => {
      this.emit('close');
    });
  }

  public send(...args: any): Promise<any> {
    log('sending message to channel: args=%o', [...args]);
    const id = this.sequentialId++;
    return new Promise<any>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.channel.send({ type: 'message', id }, ...args);
    });
  }

  on(eventName: 'close', callback: () => void): this;
  on(eventName: 'message', callback: (reply: (err: any, response?: any) => void, ...args: any) => void): this;
  on(eventName: string, callback: (...args: any) => void): this {
    switch (eventName) {
      case 'message':
        return super.on('message', (reply: (IReplyCallback), id: string, ...args: any) => {
          callback(
            (error: any, response?: any) => {
              if (error) {
                reply({ type: 'error', id, error })
              } else {
                reply({ type: 'response', id, response })
              }
            },
            ...args);
        });

      case 'close':
        return super.on('close', callback);

      default:
        throw new Error('Invalid event name ' + eventName);
    }
  }

  close() {
    this.channel.close();
    this.emit('close');
  }
}


