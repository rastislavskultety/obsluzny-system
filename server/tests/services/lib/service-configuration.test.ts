import { configurationIsValid, ServiceConfiguration, ServiceConfigurationStore } from '../../../src/services/lib/service-configuration';
import { expect } from 'chai';
import { RedisStore } from '../../../src/services/lib/redis-store';

describe('service-configuration.ts', () => { // the tests container

  let redisStore: RedisStore;

  before(async () => {
    redisStore = new RedisStore();
    await redisStore.call('flushall');
  });

  after(() => {
    redisStore.call('quit');
  })


  it('configurationIsValid() určí platnosť konfigurácie', () => {
    expect(configurationIsValid({
      numberOfQueues: 1,
      queueCapacity: 1,
      meanServiceTime: 2.5,
      serviceTimeDeviation: 0.5
    })).to.equal(true);

    expect(configurationIsValid({
      numberOfQueues: 0, // chyba
      queueCapacity: 1,
      meanServiceTime: 2.5,
      serviceTimeDeviation: 0.5
    })).to.equal(false);

    expect(configurationIsValid({
      numberOfQueues: 1.1, // chyba
      queueCapacity: 1,
      meanServiceTime: 2.5,
      serviceTimeDeviation: 0.5
    })).to.equal(false);

    expect(configurationIsValid({
      numberOfQueues: 1,
      queueCapacity: 0, // chyba
      meanServiceTime: 2.5,
      serviceTimeDeviation: 0.5
    })).to.equal(false);

    expect(configurationIsValid({
      numberOfQueues: 1,
      queueCapacity: 1.1, // chyba
      meanServiceTime: 2.5,
      serviceTimeDeviation: 0.5
    })).to.equal(false);

    expect(configurationIsValid({
      numberOfQueues: 1,
      queueCapacity: 1,
      meanServiceTime: 2.5,
      serviceTimeDeviation: -2.5 // chyba
    })).to.equal(false);
  });

  it('set zmení konfiguráciu', async () => {
    const newConfig: ServiceConfiguration = {
      numberOfQueues: 55,
      queueCapacity: 66,
      meanServiceTime: 3.3,
      serviceTimeDeviation: 1.1
    }

    const s = new ServiceConfigurationStore(redisStore);

    await s.set(newConfig);
    expect(await s.get()).to.deep.equal(newConfig);
  });


  it('set hodí chybu pre neplatnú konfiguráciu', async () => {
    let error = null;

    const newConfig: ServiceConfiguration = {
      numberOfQueues: 0, // chyba
      queueCapacity: 66,
      meanServiceTime: 3.3,
      serviceTimeDeviation: 1.1
    }

    const s = new ServiceConfigurationStore(redisStore);

    try {
      await s.set(newConfig);
    } catch (err) {
      error = err;
    }
    expect(error).to.be.an('Error')
    expect(error.message).to.equal('Invalid configuration')
  });
});
