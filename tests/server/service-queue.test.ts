import { ServiceQueue } from '../../src/server/service-queue'; // this will be your custom import
import { expect } from 'chai';

describe('Smoke test', () => { // the tests container
  it('should create ServiceQueue instance', () => {
    // the single test
    const queue = new ServiceQueue();

    expect(queue).to.be.an("object");
  });
});
