import debug from 'debug';
import { IReplyCallback, ITransportChannel } from '../transport';
import { IPC } from 'node-ipc';
import { SocketChannel } from './socket-channel';
import { defaultIpcConfig } from './ipc-config';

const debugChannel = debug('channel');

export class ServerSocketChannel extends SocketChannel implements ITransportChannel {
  protected ipc = new IPC();

  constructor(private serverName: string) {
    super();

    debugChannel('create channel for unix socket server %o', serverName);

    Object.assign(this.ipc.config, defaultIpcConfig, { id: serverName });

    this.ipc.serve(() => this.setReady());
    this.ipc.server.start();
  }

  on(eventName: 'close' | 'ready', listener: () => void): this;
  on(eventName: 'message', listener: (reply: IReplyCallback, ...args: any[]) => void): this;
  on(eventName: string, listener: (...args: any[]) => void): this {
    debugChannel('on %s', eventName);
    switch (eventName) {
      case 'message':
        this.ipc.server.on('message', (data, socket) => {
          debugChannel('received message from socket server data=%o', data);
          const reply = (value: any) => this.ipc.server.emit(socket, 'message', [value]);
          listener(reply, ...data);
        });
        break;

      case 'close':
        this.ipc.server.on('socket.disconnected', listener);
        break;

      case 'ready':
        super.on('ready', listener);
        break;

      default:
        throw new Error('Invalid event name ' + eventName);
    }
    return this;
  }

  send(...args: any[]): void {
    debugChannel('sending message to socket server args=%o', [...args]);
    throw new Error('Not implemented');
  }

  close(): void {
    debugChannel('closing');
    this.ipc.server.stop();
  }

}
