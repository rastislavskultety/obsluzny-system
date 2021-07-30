import EventEmitter from "events";
import net from 'net';


export interface SocketClientOptions {
  waitRetry: number;
}

export class SocketClient extends EventEmitter {
  private socket: net.Socket;
  // private pending: any[] = [];
  private waitRetry = 100;
  private retryTimout: NodeJS.Timeout | undefined = undefined;

  constructor(path: string, options?: SocketClientOptions) {
    super();
    this.waitRetry = options?.waitRetry || this.waitRetry;
    this.socket = this.connect(path);
  }

  private connect(path: string): net.Socket {
    this.retryTimout = undefined;

    const socket = net.createConnection({ path })
      .on('connect', () => this.emit('ready'))

      .on('data', buf => {
        const arr = JSON.parse(buf.toString());
        if (!Array.isArray(arr)) {
          throw new Error('Socket received invalid data');
        }
        const reply = (...args: any) => this.send(...args);
        this.emit('message', reply, ...arr);
      })

      .on('close', (hadError: boolean) => {
        if (hadError) {
          this.retryTimout = setTimeout(
            () => socket.connect(path),
            this.waitRetry
          );
        } else {
          this.emit('close');
        }
      })

      .on('error', err => {
        // console.log('error', err);
        // this.emit('error');
      })
    return socket;
  }

  send(...args: any) {
    const buf = Buffer.from(JSON.stringify([...args]));
    this.socket.write(buf);
    return this;
  }

  close() {
    if (this.retryTimout) clearTimeout(this.retryTimout);
    this.socket.end();
    this.socket.destroy();
    return this;
  }

  on(eventName: 'close' | 'ready', listener: (value: void) => void): this;
  // on(eventName: 'error', listener: (error: Error) => void): this;
  on(eventName: 'message', listener: (...args: any) => void): this;
  on(eventName: string, listener: (...args: any) => void): this {
    if (!['close', 'ready', 'message'].includes(eventName)) throw new Error('Invalid event ' + eventName);
    return super.on(eventName, listener);
  }
}
