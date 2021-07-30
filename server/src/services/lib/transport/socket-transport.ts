import { IReplyCallback, Transport } from './transport';
import { SocketClient, SocketServer } from '../socket';

export function createSocketTransport(socket: SocketServer | SocketClient): Transport {
  return new Transport({
    on(eventName: string, callback: (...args: any) => void): void {
      switch (eventName) {
        case 'message':
        case 'close':
          socket.on(eventName as any, callback);
          break;

        default:
          throw new Error('Invalid event name ' + eventName);
      }
    },
    send(...args: any): void {
      socket.send(...args);
    },
    close(): void {
      socket.close();
    },
  });
}

