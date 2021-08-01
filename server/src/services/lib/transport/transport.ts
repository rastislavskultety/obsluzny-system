import { EventEmitter } from 'events';
import debug from 'debug';

const debugTransport = debug('transport');

export type IReplyCallback = (value: any) => void;

export interface ITransportChannel {
  on(eventName: 'close' | 'ready', listener: () => void): this;
  on(eventName: 'message', listener: (reply: IReplyCallback, ...args: any[]) => void): this;
  send(...args: any[]): void;
  close(): void;
  isReady(): boolean;
}

interface PendingResponse {
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

interface Envelope {
  id: number;
}

interface MessageEnvelope extends Envelope {
  type: 'message';
  id: number;
}

interface ResponseEnvelope extends Envelope {
  type: 'response';
  response: any;
}

interface ErrorEnvelope extends Envelope {
  type: 'error';
  error: any;
}

export interface TransportOptions {
  // Error objekt nemá enumerable vlastnosti, preto sa pri prenose cez JSON.stringify stratí obsah.
  // errorProxy = true rieši tento problém.
  errorProxy: boolean;
}

export class Transport extends EventEmitter {

  private sequentialId = 0;
  private pending = new Map<number, PendingResponse>();
  private readyPromise: Promise<void>;
  private setReady: null | (() => unknown) = null;

  private errorProxy: boolean;

  constructor(private channel: ITransportChannel, options?: TransportOptions) {
    super();
    this.errorProxy = options?.errorProxy === true;
    this.readyPromise = new Promise(resolve => this.setReady = resolve);
    this.initialize();
  }

  private initialize() {

    // Listener pre správy ktoré prichádzajú z kanála
    //
    // Správy môžu mať nasledujúcu štruktúru
    //
    // - požiadavka { id, type='message' }, arg1, arg2, ...
    // - odpoveď na požiadavku { id, type="response", response=<value> }
    // - chybová odpoveď na požiadavku { id, type="error", error=<error>}
    this.channel.on('message', (reply, env: MessageEnvelope | ResponseEnvelope | ErrorEnvelope, ...args: any[]) => {
      debugTransport('received message from channel: env=%o, args=%o', env, [...args]);

      const { id, type } = env;
      switch (type) {
        case 'message':
          try {
            this.emit('message', reply, id, ...args);
          }
          catch (error) {
            reply(this.createErrorEnvelope(id, error));
          }
          break;
        case 'response':
          {
            const p = this.pending.get(id);
            this.pending.delete(id)
            if (typeof p === 'undefined') {
              throw new Error('Transport: invalid sequence id');
            } else {
              p.resolve((env as ResponseEnvelope).response);
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

    this.channel.on('ready', () => this.setReady && this.setReady());
    if (this.channel.isReady()) {
      setImmediate(() => this.setReady && this.setReady());
    }
  }

  public send(...args: any[]): Promise<any> {
    debugTransport('sending message to channel: args=%o', [...args]);
    const id = this.sequentialId++;
    return new Promise<any>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.channel.send(this.createMessageEnvelope(id), ...args);
    });
  }

  on(eventName: 'close' | 'ready', listener: () => void): this;
  on(eventName: 'message', listener: (reply: (err: any, response?: any) => void, ...args: any[]) => void): this;
  on(eventName: string, listener: (...args: any[]) => void): this {
    switch (eventName) {
      case 'message':
        return super.on('message', (reply: (IReplyCallback), id: number, ...args: any[]) => {
          const listenerReply = (error: any, response?: any) => {
            if (error) {
              reply(this.createErrorEnvelope(id, error));
            } else {
              reply(this.createResponseEvelope(id, response));
            }
          };

          listener(listenerReply, ...args);
        });

      case 'close':
      case 'ready':
        return super.on('close', listener);

      default:
        throw new Error('Invalid event name ' + eventName);
    }
  }

  close() {
    this.channel.close();
    this.emit('close');
  }

  waitReady(): Promise<void> {
    return this.readyPromise;
  }


  private createMessageEnvelope(id: number): MessageEnvelope {
    return {
      id,
      type: 'message'
    }
  }

  private createResponseEvelope(id: number, response: any): ResponseEnvelope {
    return {
      id,
      type: 'response',
      response
    }
  }

  private createErrorEnvelope(id: number, error: any): ErrorEnvelope {
    // Pretože Error objekt má property nastavené na enumerable = false, tak ak sa spraví JSON.stringify,
    // tak nie sú do neho zahrnuté žiadne property.
    // Preto spravíme proxy objekt ktorý zmení všetky vlastnosti na enumerable
    if (this.errorProxy) {
      const makeEnumerableHandler = {
        getOwnPropertyDescriptor(target: any, prop: PropertyKey) {
          return Object.assign({}, Object.getOwnPropertyDescriptor(target, prop), { enumerable: true });
        }
      };
      error = new Proxy(error, makeEnumerableHandler);
    }

    return {
      id,
      type: 'error',
      error
    };
  }
}
