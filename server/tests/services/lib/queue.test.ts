import { expect } from 'chai';
import { Queue, IServiceCenter } from '../../../src/services/lib/queues';

interface TestRequest {
  id: string;
}

interface TestResponse {
  value: string;
}

class CenterStub implements IServiceCenter<TestRequest, TestResponse> {
  private paused = false;
  private pending: TestResponse | null = null;
  private resume: null | ((response: TestResponse) => void) = null;
  public numberOfRequests = 0;

  async serve(request: TestRequest): Promise<TestResponse> {
    const response = { value: request.id };
    if (this.paused) {
      if (this.pending) throw new Error('Service center cannot process new request before old one is finished');
      this.pending = response;
      return new Promise(resolve => {
        this.resume = resolve;
      })
    }
    this.numberOfRequests += 1;
    return response;
  }

  start() {
    this.paused = false;
    if (this.pending) {
      this.numberOfRequests += 1;
      const pending = this.pending;
      this.pending = null;
      if (this.resume) {
        this.resume(pending);
      } else {
        throw Error('CenterStub: cannot resume')
      }
    }
  }

  stop() {
    this.paused = true;
  }
}

function almostEqual(actual: number, expected: number, tolerance: number): boolean {
  return Math.abs((actual - expected) / expected) <= tolerance;
}

describe('queue.ts', () => { // the tests container
  it('Vytvorí frontu a zaplní ju 3 požiadavkami', async () => {
    const center = new CenterStub();
    const queue = new Queue<TestRequest, TestResponse>(1, center);
    const capacity = 3;
    const results = [];

    center.stop();
    results.push(queue.enqueue({ id: 'req1' }, capacity));
    results.push(queue.enqueue({ id: 'req2' }, capacity));
    results.push(queue.enqueue({ id: 'req3' }, capacity));

    expect(center.numberOfRequests).to.equal(0);

    // daľší požiadavok musí byť zamietnutý
    let error = null;
    try {
      await queue.enqueue({ id: 'req3' }, capacity);
    } catch (err) {
      error = err;
    }
    expect(error).to.be.an('Error')
    expect(error.message).to.equal('Queue capacity exceeded')

    center.start();

    expect(await Promise.all(results)).to.deep.equal([{ value: 'req1' }, { value: 'req2' }, { value: 'req3' }]);
    expect(center.numberOfRequests).to.equal(3);
  });

  it('Správne vypočíta štatistické údaje', async () => {

    const TIME_TOLERANCE = 0.15;

    await sleep(100); // počkaj aby sa dokončili iné procesy aby bolo presnejšie meranie času

    const center = new CenterStub();
    const queue = new Queue<TestRequest, TestResponse>(1, center);
    const capacity = 10;
    const results = [];

    center.stop();
    await sleep(100); // idle

    for (let i = 0; i < capacity; ++i) {
      results.push(queue.enqueue({ id: `req${i}` }, capacity));
    }

    // daľší požiadavok musí byť zamietnutý
    let error = null;
    try {
      await queue.enqueue({ id: 'another' }, capacity);
    } catch (err) {
      error = err;
    }
    expect(error).to.be.an('Error')
    expect(error.message).to.equal('Queue capacity exceeded')

    for (let i = 0; i < capacity; ++i) {
      await sleep(50); // spracuj požiadavku po 50ms
      center.start();
      center.stop();
    }

    center.start();

    await Promise.all(results);

    expect(center.numberOfRequests).to.equal(capacity);

    await sleep(5); // počkaj kým dobehne aktualizácia štatistík

    const stats = await queue.getStats();
    expect(stats.completedRequests).to.eq(capacity);
    expect(stats.rejectedRequests).to.eq(1);
    expect(stats.queuedRequests).to.eq(0);
    expect(almostEqual(stats.serviceIdleTime, 100, TIME_TOLERANCE)).to.eq(true);
    expect(almostEqual(stats.serviceBusyTime, 50 * capacity, TIME_TOLERANCE)).to.eq(true);

    // vypočiťaj celkovú dobu čakania
    let n = 0;
    for (let i = 0; i <= capacity; ++i) {
      n += i;
    }
    expect(almostEqual(stats.totalWaitTime, 50 * n, TIME_TOLERANCE)).to.eq(true);
  });
});

function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
