import { Queue } from "../lib/queue";
import { isMainThread, workerData, parentPort } from 'worker_threads';
import { createMessagePortTransport } from "../lib/worker-thread-transport";
import { ServiceCenter, ServiceRequest, ServiceResponse } from "../service";


if (isMainThread) {
  console.error('worker.ts should be run as worker_thread');
  process.exit(2);
}

const transport = createMessagePortTransport(parentPort!);

const id = workerData.id;
if (!Number.isInteger(id)) {
  console.error('worker expect id parameter as an integer number');
  process.exit(2);
}

// const serviceCenter = workerData.serviceCenter as ServiceCenter;
// if (!serviceCenter) {
//   console.error('worker expect center');
//   process.exit(2);
// }
const serviceCenter = new ServiceCenter();


console.log('worker thread', id, 'start')

// export function workerQueue<Request, Response>(id: number, center: IServiceCenter<Request, Response>, socket: ISocket): Promise<void> {
//   return new Promise((resolve, reject) => {
//     try {
const queue = new Queue<ServiceRequest, ServiceResponse>(id, serviceCenter);

// class MessageWrapper  {
//   private emitter = new EventEmitter();
//   constructor( transport: Transport) {
//     transport.onMessage((message: string, ...args: any) => this.emitter.emit(message, ...args));
//   }

//   on()

// }


transport.onMessage(async (message: string, ...args) => {
  switch (message) {
    case 'destroy':
      console.log('worker thread', id, 'exit')
      transport.close();
      process.exit();

    case 'length':
      return queue.length();

    case 'enqueue':
      {
        const [request, capacity] = args;
        return queue.enqueue(request, capacity);
      }

    case 'getStats':
      return queue.getStats();

    case 'resetStats':
      return queue.resetStats();
  }
});

// transport.on('destroy', async () => {
//   console.log('worker thread', id, 'exit')
//   transport.close();
//   process.exit();
// });
// transport.on('length', async () => queue.length());
// transport.on('enqueue', async (request: ServiceRequest, capacity: number) => queue.enqueue(request, capacity));
// transport.on('getStats', async () => queue.getStats());
// transport.on('resetStats', async () => queue.resetStats());
//     }
//     catch (err) {
//       reject(err);
//     }
//   });
// }


