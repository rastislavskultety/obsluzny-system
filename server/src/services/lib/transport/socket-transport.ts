import debug from 'debug';
import { IReplyCallback, ITransportChannel, Transport } from './transport';
import { IPC } from 'node-ipc';
import { EventEmitter } from 'stream';

const debugChannel = debug('channel');
const debugSocket = debug('socket');

const defaultIpcConfig = {
  retry: 1500,
  maxRetries: 10,
  logger: debugSocket,
  silent: !debugSocket.enabled
}

abstract class SocketChannel extends EventEmitter {
  private ready = false;

  public isReady(): boolean {
    return this.ready;
  }

  protected setReady() {
    this.ready = true;
    this.emit('ready');
  }
}

class ServerSocketChannel extends SocketChannel implements ITransportChannel {
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

class ClientSocketChannel extends SocketChannel implements ITransportChannel {
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

export function createServerSocketTransport(serverName: string): Transport {
  return new Transport(new ServerSocketChannel(serverName), { errorProxy: true });
}
export function createClientSocketTransport(serverName: string, clientName: string): Transport {
  return new Transport(new ClientSocketChannel(serverName, clientName), { errorProxy: true });
}
