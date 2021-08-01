import { QueueStats } from "./queue";

/*
 * Definícia rozhrania strediska, ktoré používa fronta na vybavovie požiadaviek
 */
export interface IServiceCenter<Request, Response> {
  serve: (request: Request) => Promise<Response>;
}

/*
 * Interface pre frontu.
 *
 * Definuje tu metódy ktoré využíva QueuePool. Predpokladá sa že fronta funguje asynchrónne,
 * napríklad môže byť na inom serveri, ale táto implementácia by mohla fungovať aj synchrónne.
 */
// export interface IQueueManagedByPool {
//   id: number;
//   length: () => Promise<number>;
//   destroy: () => Promise<void>;
// }

// export interface IPool<T extends IQueueManagedByPool> {
//   allocateQueue(maxNumberOfQueues: number): Promise<T>;
//   destroyStaleQueues(maxNumberOfQueues: number): Promise<void>;
//   destroyAllQueues(): Promise<void>;
//   count(): Promise<number>;
//   forEachQueue(callback: (queue: T, index?: number, arr?: T[]) => void): Promise<void>;
// }

export interface IQueue<Request, Response> {
  id: number;
  length: () => Promise<number>;
  destroy: () => Promise<void>;
  enqueue(request: Request, capacity: number): Promise<Response>;
  getStats(): Promise<QueueStats>
  resetStats(): Promise<void>
}
