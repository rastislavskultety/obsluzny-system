import debug from 'debug';
import { IReplyCallback, ITransportChannel } from '../transport';
import { IPC } from 'node-ipc';
import { SocketChannel } from './socket-channel';
import { defaultIpcConfig } from './ipc-config';

const debugChannel = debug('channel');

export class ClientSocketChannel extends SocketChannel implements ITransportChannel {
  protected ipc = new IPC();
  protected socket;


  constructor(private serverName: string, private clientName: string) {
    super();

    debugChannel('creating channel for unix socket %o connecting to %o', clientName, serverName);

    Object.assign(this.ipc.config, defaultIpcConfig, { id: clientName });

    this.ipc.connectTo(serverName, () => this.setReady());
    this.socket = this.ipc.of[serverName];
  }

  on(eventName: 'close' | 'ready', listener: () => void): this;
  on(eventName: 'message', listener: (reply: IReplyCallback, ...args: any[]) => void): this;
  on(eventName: string, listener: (...args: any[]) => void): this {
    debugChannel('on %s', eventName);
    switch (eventName) {
      case 'message':
        this.socket.on('message', (data: any[]) => {
          debugChannel('received message from socket client data=%o', data);
          const reply = (value: any) => this.send(value);
          listener(reply, ...data);
        });
        break;

      case 'close':
        this.socket.on('disconnect', listener);
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
    debugChannel('sending message to socket client args=%o', [...args]);
    this.socket.emit('message', [...args])
  }

  close(): void {
    debugChannel('closing');
    this.ipc.disconnect(this.serverName);
  }
}
