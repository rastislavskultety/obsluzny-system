import debug from 'debug';
import { isMainThread, parentPort, Worker, workerData } from "worker_threads";

const debugWorker = debug('worker');

export async function createWorkerThread(file: string, data: { [index: string]: any }): Promise<Worker> {
  debugWorker('Starting thread %o', file);

  const worker = new Worker(file, { workerData: data });
  worker.on('exit', () => {
    debugWorker('Worker thread %o exited', file);
  })

  return new Promise((resolve, reject) => worker.on('message', (value) => {
    switch (value) {
      case 'ready':
        resolve(worker);
        break;
      case 'error':
        reject(new Error('Worker thread error'));
        break;
    }
  }));
}

export function checkIsWorkerThread(label: string) {
  if (isMainThread) throw new Error(`${label} cannot be run as main thread`);
}

export function signalReady(...args: Promise<unknown>[]) {
  checkIsWorkerThread('signalReady');
  Promise
    .all([...args])
    .then(() => parentPort!.postMessage('ready'))
    .catch((err) => parentPort!.postMessage('error'));
}

export function validateWorker(threadName: string, workerDataFields?: { [index: string]: string }) {
  checkIsWorkerThread(`${threadName}:`);

  if (workerDataFields) {
    for (const fieldName in workerDataFields) {
      if (typeof workerData[fieldName] !== workerDataFields[fieldName]) {
        // tslint:disable-next-line:no-console
        console.error(`Error: ${threadName}: missing or invalid field ${fieldName} in workerData`);
        process.exit(2)
      }
    }
  }
}
