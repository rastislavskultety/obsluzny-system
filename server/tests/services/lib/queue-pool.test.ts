import { QueuePool, IQueue } from '../../../src/services/lib/queue-pool';
import { expect } from 'chai';


class QueueStub implements IQueue {
  private _length = 0;

  constructor(public id: number) {
    QueueStub.createCount += 1;
  }

  async length() {
    return this._length;
  }

  setLength(value: number) {
    this._length = value;
  }

  async destroy() {
    QueueStub.destroyCount += 1;
  }

  public static destroyCount = 0;
  public static createCount = 0;

  public static reset() {
    this.createCount = 0;
    this.destroyCount = 0;
  }
}

async function queueFactory(id: number) {
  return new QueueStub(id);
}

describe('queue-pool.ts', () => {
  it('Vytvorenie queue managera', () => {
    let qm = new QueuePool<QueueStub>(queueFactory);
    expect(qm).to.be.an('object');
  });

  it('Alokovanie fronty', async () => {
    QueueStub.reset();

    let qm = new QueuePool<QueueStub>(queueFactory);

    let n = 10; // maximálny počet front
    const queues = [];

    for (let i = 0; i < n; ++i) {
      let queue = await qm.allocateQueue(n);
      expect(queue).to.be.an('object');
      expect(queue.id).to.eq(i);
      expect(queues.includes(queue)).to.eq(false);
      queues.push(queue);
    }

    // fronta n + 1 sa už nemôže vytvoriť, pretože by presiahla max. počet front
    // allocateQueue musí vrátiť už existujúci rad
    let queue = await qm.allocateQueue(n);
    expect(queue).to.be.an('object');
    expect(queues.includes(queue)).to.eq(true);

    expect(await qm.count()).to.eq(10);
    expect(QueueStub.createCount).to.eq(10);
    expect(QueueStub.destroyCount).to.eq(0);

    await qm.destroyAllQueues(); // vymazanie všetkých front
    expect(QueueStub.destroyCount).to.eq(10);
  });


  it('Vyhľadanie najkratšej fronty', async () => {
    QueueStub.reset();

    let qm = new QueuePool<QueueStub>(queueFactory);

    let limit = 10; // maximálny počet front
    let shortestIndex = 5;

    for (let i = 0; i < limit; ++i) {
      let queue = await qm.allocateQueue(limit);
      queue.setLength(i == shortestIndex ? 1 : 5);
      expect(queue.id).to.eq(i);
    }

    let queue = await qm.allocateQueue(limit);
    expect(queue.id).to.eq(shortestIndex);

    await qm.destroyAllQueues(); // vymazanie všetkých front

  });

  it('Zníženie maximálneho počtu front', async () => {
    QueueStub.reset();

    let qm = new QueuePool<QueueStub>(queueFactory);

    let limit = 10; // maximálny počet front
    const queues = [];

    for (let i = 0; i < limit; ++i) {
      let queue = await qm.allocateQueue(limit);
      expect(queue).to.be.an('object');
      expect(queues.includes(queue)).to.eq(false);
      queues.push(queue);
    }
    expect(QueueStub.createCount).to.eq(limit);

    const newLimit = 5;

    for (let i = 0; i < 100; ++i) {
      let queue = await qm.allocateQueue(newLimit);
      expect(queue.id).to.be.lessThan(newLimit);
    }

    expect(QueueStub.createCount).to.eq(limit);

    expect(QueueStub.destroyCount).to.eq(0);
    await qm.destroyStaleQueues(newLimit);
    expect(QueueStub.destroyCount).to.eq(limit - newLimit);

    await qm.destroyAllQueues(); // vymazanie všetkých front
    expect(QueueStub.destroyCount).to.eq(limit);
  });
});
