import { Transport } from "../transport";
import { ClientSocketChannel } from "./client-socket-channel";
import { ServerSocketChannel } from "./server-socket-channel";

export function createServerSocketTransport(serverName: string): Transport {
  return new Transport(new ServerSocketChannel(serverName), { errorProxy: true });
}

export function createClientSocketTransport(serverName: string, clientName: string): Transport {
  return new Transport(new ClientSocketChannel(serverName, clientName), { errorProxy: true });
}
