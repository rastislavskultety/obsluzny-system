/*
 * Parametre spracovania požiadaviek.
 *
 * Tieto parametre je možné dynamicky meniť počas behu serveru pomocou api
 */

import configuration from '../../configuration';

/*
 * Definícia štruktúry parametrov
 */
export interface ServiceConfiguration {
  numberOfQueues: number; // parameter n, celé číslo > 0
  queueCapacity: number; // parameter m, celé číslo > 0
  meanServiceTime: number; // parameter t, v sekundách, >= 0
  serviceTimeDeviation: number; // parameter r, v sekundách, musí byť >= 0 a zároveň < meanServiceTime
}

/*
 * Default parametre nastavené pri štarte servera.
 */
export const defaultConfiguration: ServiceConfiguration = Object.assign({
  numberOfQueues: 10,
  queueCapacity: 5,
  meanServiceTime: 1.0,
  serviceTimeDeviation: 0.5
}, configuration.service);

/*
 * Aktuálne nastavenie parametrov
 */
const currentConfiguration: ServiceConfiguration = Object.assign({}, defaultConfiguration);

/*
 * Test validity parametrov
 */
export function configurationIsValid(config: ServiceConfiguration): boolean {
  return Number.isInteger(config.numberOfQueues) &&
    config.numberOfQueues > 0 &&
    Number.isInteger(config.queueCapacity) &&
    config.queueCapacity > 0 &&
    config.meanServiceTime >= 0 &&
    config.serviceTimeDeviation >= 0;
}

/*
 * Získanie parametrov
 *
 * Asynchrónnosť je tu aby sa mohlo v budúcnosti prejsť na externú databázu
 */
export async function getConfiguration(): Promise<ServiceConfiguration> {
  return currentConfiguration;
}

/*
 * Nastavenie parametrov
 *
 * Asynchrónnosť je tu aby sa mohlo v budúcnosti prejsť na externú databázu
 */
export async function setConfiguration(config: ServiceConfiguration): Promise<void> {
  if (!configurationIsValid(config)) throw Error("Invalid configuration");
  Object.assign(currentConfiguration, config);
}
