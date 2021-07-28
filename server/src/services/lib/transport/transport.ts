import { EventEmitter } from 'events';

export interface IReceivePort {
  onMessage(callback: (...args: any) => void): void;
  onClose(callback: () => void): void;
  close(): void;
}

export interface ISendPort {
  send(...args: any): void;
  onClose(callback: () => void): void;
  close(): void;
}

export interface ITransportChannel {
  receivePort: IReceivePort,
  sendPort: ISendPort
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

export class Transport {

  private emitter = new EventEmitter();

  private sequentialId = 0;
  private pending = new Map<number, PendingResponse>();

  constructor(private receivePort: IReceivePort, private sendPort: ISendPort) {
    this.initialize();
  }

  private initialize() {
    this.receivePort.onMessage((env: MessageEnvelope | ReplyEnvelope | ErrorEnvelope, ...args: any) => {
      const { id, type } = env;
      switch (type) {
        case 'message':
          this.emitter.emit('message', id, ...args);
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
        //
      } // switch
    }); // onMessage

    this.receivePort.onClose(() => {
      this.close();
    });

    this.sendPort.onClose(() => {
      this.close();
    });
  }

  public send(...args: any): Promise<any> {
    const id = this.sequentialId++;
    return new Promise<any>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.sendPort.send({ type: 'message', id }, ...args);
    });
  }

  onMessage(callback: (...args: any) => Promise<any>): void {
    this.emitter.on('message', (id: string, ...args: any) => {
      callback(...args)
        .then(response => this.sendPort.send({ type: 'response', id, response }))
        .catch(error => this.sendPort.send({ type: 'error', id, error }));
    });
  }

  onClose(callback: () => void) {
    this.emitter.once('close', callback)
  }

  close() {
    this.receivePort.close();
    this.sendPort.close();
    this.emitter.emit('close');
  }
}


