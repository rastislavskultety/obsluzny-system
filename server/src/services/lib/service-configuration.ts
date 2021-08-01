/*
 * Parametre spracovania požiadaviek.
 *
 * Tieto parametre je možné dynamicky meniť počas behu serveru pomocou api
 */

import { RedisStore } from "./redis-store";

/*
 * Definícia štruktúry parametrov
 */
export interface ServiceConfigurationData {
  numberOfQueues: number; // parameter n, celé číslo > 0
  queueCapacity: number; // parameter m, celé číslo > 0
  meanServiceTime: number; // parameter t, v sekundách, >= 0
  serviceTimeDeviation: number; // parameter r, v sekundách, musí byť >= 0 a zároveň < meanServiceTime
}

// /*
//  * Default parametre nastavené pri štarte servera.
//  */
// export const defaultConfiguration: ServiceConfigurationData = Object.assign({
//   numberOfQueues: 10,
//   queueCapacity: 5,
//   meanServiceTime: 1.0,
//   serviceTimeDeviation: 0.5
// });

/*
 * Test validity parametrov
 */
export function configurationIsValid(config: ServiceConfigurationData): boolean {
  return Number.isInteger(config.numberOfQueues) &&
    config.numberOfQueues > 0 &&
    Number.isInteger(config.queueCapacity) &&
    config.queueCapacity > 0 &&
    config.meanServiceTime >= 0 &&
    config.serviceTimeDeviation >= 0;
}

export class ServiceConfigurationStore {

  constructor(private store: RedisStore) { }

  async get(): Promise<ServiceConfigurationData> {
    const configJson = await this.store.call('get', 'service');
    return JSON.parse(configJson);
  }

  async set(config: ServiceConfigurationData) {
    if (!configurationIsValid(config)) throw new Error("Invalid configuration");
    await this.store.call('set', 'service', JSON.stringify(config));
  }
}
