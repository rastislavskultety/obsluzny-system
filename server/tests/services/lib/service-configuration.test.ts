import * as Cfg from '../../../src/services/lib/service-configuration';
import { expect } from 'chai';

describe('service-configuration.ts', () => { // the tests container
  it('Je nastavená konfigurácia', async () => {
    const config = await Cfg.getConfiguration();
    expect(config).to.be.an("object");
    // expect(config).to.deep.equal(Cfg.defaultConfiguration);
  });

  it('configurationIsValid() určí platnosť konfigurácie', () => {
    expect(Cfg.configurationIsValid({
      numberOfQueues: 1,
      queueCapacity: 1,
      meanServiceTime: 2.5,
      serviceTimeDeviation: 0.5
    })).to.equal(true);

    expect(Cfg.configurationIsValid({
      numberOfQueues: 0, // chyba
      queueCapacity: 1,
      meanServiceTime: 2.5,
      serviceTimeDeviation: 0.5
    })).to.equal(false);

    expect(Cfg.configurationIsValid({
      numberOfQueues: 1.1, // chyba
      queueCapacity: 1,
      meanServiceTime: 2.5,
      serviceTimeDeviation: 0.5
    })).to.equal(false);

    expect(Cfg.configurationIsValid({
      numberOfQueues: 1,
      queueCapacity: 0, // chyba
      meanServiceTime: 2.5,
      serviceTimeDeviation: 0.5
    })).to.equal(false);

    expect(Cfg.configurationIsValid({
      numberOfQueues: 1,
      queueCapacity: 1.1, // chyba
      meanServiceTime: 2.5,
      serviceTimeDeviation: 0.5
    })).to.equal(false);

    expect(Cfg.configurationIsValid({
      numberOfQueues: 1,
      queueCapacity: 1,
      meanServiceTime: 2.5,
      serviceTimeDeviation: -2.5 // chyba
    })).to.equal(false);
  });

  it('setConfiguration zmení konfiguráciu', async () => {
    const newConfig: Cfg.ServiceConfiguration = {
      numberOfQueues: 55,
      queueCapacity: 66,
      meanServiceTime: 3.3,
      serviceTimeDeviation: 1.1
    }
    await Cfg.setConfiguration(newConfig);
    expect(await Cfg.getConfiguration()).to.deep.equal(newConfig);
  });


  it('setConfiguration hodí chybu pre neplatnú konfiguráciu', async () => {
    let error = null;

    const newConfig: Cfg.ServiceConfiguration = {
      numberOfQueues: 0, // chyba
      queueCapacity: 66,
      meanServiceTime: 3.3,
      serviceTimeDeviation: 1.1
    }
    try {
      await Cfg.setConfiguration(newConfig);
    } catch (err) {
      error = err;
    }
    expect(error).to.be.an('Error')
    expect(error.message).to.equal('Invalid configuration')
  });
});
