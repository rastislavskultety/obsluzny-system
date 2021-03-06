import { expect } from 'chai';
import { IManagedQueue, QueueManager } from '../../../src/services/lib/queues/queue-manager';
// import { ServiceConfiguration } from '../../../src/services/lib/service-configuration'


// interface Request { }
// interface Response { }

// class ServiceConfigurationStoreStub {
//   get(): ServiceConfiguration {
//     const conf: ServiceConfiguration = {
//       numberOfQueues: 3,
//       queueCapacity: 5,
//       meanServiceTime: 1,
//       serviceTimeDeviation: 1
//     }
//     return conf;
//   }
// }

class QueueStub implements IManagedQueue {
  private _length = 0;

  constructor(public id: number) {
    QueueStub.createCount += 1;
  }

  length(): Promise<number> {
    return Promise.resolve(this._length);
  }

  setLength(value: number) {
    this._length = value;
  }

  destroy(): Promise<void> {
    QueueStub.destroyCount += 1;
    return Promise.resolve();
  }

  // enqueue(request: Request): Promise<Response> {
  //   return Promise.resolve(null);
  // }

  // getStats(): Promise<QueueStats> {
  //   return Promise.resolve(null)
  // }

  // resetStats(): Promise<void> {
  //   return Promise.resolve()
  // }

  public static destroyCount = 0;
  public static createCount = 0;

  public static reset() {
    this.createCount = 0;
    this.destroyCount = 0;
  }
}

function createQueueManager() {
  function queueFactory(id: number) {
    return Promise.resolve(new QueueStub(id));
  }
  return new QueueManager<QueueStub>(queueFactory);
}

// function callMethod(obj: any, method: string, ...args: any[]) {
//   const fn: any = obj[method];

//   if (typeof fn === 'function') {
//     return fn.call(obj, ...args);
//   }
//   else {
//     throw new Error('Calling invalid method ' + method)
//   }
// }


// const store = new ServiceConfigurationStoreStub();

describe('queue-manager.ts', () => {
  it('Vytvorenie queue managera', () => {
    const qm = createQueueManager();
    expect(qm).to.be.an('object');
  });

  it('Alokovanie fronty', async () => {
    QueueStub.reset();

    const qm = createQueueManager();

    const n = 10; // maxim??lny po??et front
    const queues = [];

    for (let i = 0; i < n; ++i) {
      const queue = await (qm as any).allocateQueue(n);
      expect(queue).to.be.an('object');
      expect(queue.id).to.eq(i);
      expect(queues.includes(queue)).to.eq(false);
      queues.push(queue);
    }

    // fronta n + 1 sa u?? nem????e vytvori??, preto??e by presiahla max. po??et front
    // allocateQueue mus?? vr??ti?? u?? existuj??ci rad
    const queue = await (qm as any).allocateQueue(n);
    expect(queue).to.be.an('object');
    expect(queues.includes(queue)).to.eq(true);

    expect(await qm.count()).to.eq(10);
    expect(QueueStub.createCount).to.eq(10);
    expect(QueueStub.destroyCount).to.eq(0);

    await qm.destroyAllQueues(); // vymazanie v??etk??ch front
    expect(QueueStub.destroyCount).to.eq(10);
  });


  it('Vyh??adanie najkrat??ej fronty', async () => {
    QueueStub.reset();

    const qm = createQueueManager();

    const limit = 10; // maxim??lny po??et front
    const shortestIndex = 5;

    for (let i = 0; i < limit; ++i) {
      const queue = await (qm as any).allocateQueue(limit);
      queue.setLength(i == shortestIndex ? 1 : 5);
      expect(queue.id).to.eq(i);
    }

    const queue = await (qm as any).allocateQueue(limit);
    expect(queue.id).to.eq(shortestIndex);

    await qm.destroyAllQueues(); // vymazanie v??etk??ch front

  });

  it('Zn????enie maxim??lneho po??tu front', async () => {
    QueueStub.reset();

    const qm = createQueueManager();

    const limit = 10; // maxim??lny po??et front
    const queues = [];

    for (let i = 0; i < limit; ++i) {
      const queue = await (qm as any).allocateQueue(limit);
      expect(queue).to.be.an('object');
      expect(queues.includes(queue)).to.eq(false);
      queues.push(queue);
    }
    expect(QueueStub.createCount).to.eq(limit);

    const newLimit = 5;

    for (let i = 0; i < 100; ++i) {
      const queue = await (qm as any).allocateQueue(newLimit);
      expect(queue.id).to.be.lessThan(newLimit);
    }

    expect(QueueStub.createCount).to.eq(limit);

    expect(QueueStub.destroyCount).to.eq(0);
    await (qm as any).destroyStaleQueues(newLimit);
    expect(QueueStub.destroyCount).to.eq(limit - newLimit);

    await (qm as any).destroyAllQueues(); // vymazanie v??etk??ch front
    expect(QueueStub.destroyCount).to.eq(limit);
  });
});
