import net from 'net';
import { access, unlink } from "fs/promises";
import EventEmitter from 'events';


export type IReplyCallback = (value: any) => void;

export class SocketServer extends EventEmitter {
  private server: net.Server | null = null;

  constructor(path: string) {
    super();
    this.initialize(path).catch((err: Error) => { throw err });
  }

  private async initialize(path: string) {

    // Delete old socket if exists

    let fileExists;
    try {
      await access(path);
      fileExists = true;
    } catch {
      fileExists = false;
    }

    if (fileExists) {
      await unlink(path);
    }

    this.server = net
      .createServer()
      .on('connection', socket => {
        socket.on('end', () => {
          this.emit('disconnect');
        });
        socket.on('data', buf => {
          let arr;
          let str = buf.toString();
          try {
            arr = JSON.parse(str);
          } catch (error) {
            throw new Error('Socket cannot parse data as json: ' + str);
          }
          if (!Array.isArray(arr)) {
            throw new Error('Socket received invalid data');
          }
          const reply = (value: any) => {
            socket.write(Buffer.from(JSON.stringify([value])));
          }
          this.emit('message', reply, ...arr);
        });
      })
      .on('error', (err) => {
        this.close();
        throw err;
      })
      .on('close', () => this.emit('close'))
      .on('listening', () => {
        this.emit('ready');
      })
      .listen(path)
  }

  close() {
    this.server?.close();
    return this;
  }

  on(eventName: 'close' | 'ready' | 'disconnect', listener: () => void): this;
  on(eventName: 'message', listener: (reply: IReplyCallback, ...args: any) => void): this;
  on(eventName: string, listener: (...args: any) => void): this {
    if (!['close', 'ready', 'message', 'disconnect'].includes(eventName)) throw new Error('Invalid event ' + eventName);
    return super.on(eventName, listener);
  }

  send(...args: any) {
    throw new Error('Not implemented');
  }
}
