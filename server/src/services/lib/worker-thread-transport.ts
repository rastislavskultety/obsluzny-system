import { Transport } from './hooked-transport';
import { Worker, MessagePort } from 'worker_threads';

export function createMessagePortTransport(messagePort: MessagePort): Transport {
  const receivePort = {
    onMessage(callback: (...args: any) => void): void {
      messagePort.on('message', (value: any[]) => callback(...value));
    },
    onClose(callback: () => void): void {
      messagePort.on('close', callback);
    },
    close(): void {
      messagePort.close();
    },
  };

  const sendPort = {
    send(...args: any): void {
      messagePort.postMessage([...args]);
    },
    onClose(callback: () => void): void {
      messagePort.on('close', callback);
    },
    close(): void {
      messagePort.close();
    },
  };

  return new Transport(receivePort, sendPort);
}


export function createWorkerTransport(worker: Worker): Transport {
  const receivePort = {
    onMessage(callback: (...args: any) => void): void {
      worker.on('message', (value: any[]) => callback(...value));
    },
    onClose(callback: () => void): void {
      worker.on('exit', callback);
    },
    close(): void {
      worker.terminate();
    },
  };

  const sendPort = {
    send(...args: any): void {
      worker.postMessage([...args]);
    },
    onClose(callback: () => void): void {
      worker.on('exit', callback);
    },
    close(): void {
      worker.terminate();
    },

  };
  return new Transport(receivePort, sendPort);
}


