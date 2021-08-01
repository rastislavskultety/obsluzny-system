/*
 * Simulácia strediska pre vybavovanie požiadaviek
 *
 * Stredisko dostáva požiadavky na vrátenie záznamov z databázy citátov známych osobností.
 * Požiadavky špecifikujú počet citátov, ktoré požadujú v rámci jednej služby.
 */

import { IServiceCenter } from "./queue";
import { fetchRandomQuotes, Quote } from "./quotes";
import { RemoteQueue } from "./remote-queue";
import { rpc } from "./rpc";
import debug from 'debug';
import { ServiceConfigurationStore } from "./service-configuration";

const debugService = debug('service')

/*
 * Požiadavka užívateľa - počet požadovaných citátov
 */
export interface ServiceRequest {
  count: number;
}

/*
 * Odpoveď strediska na požiadavku užívateľa - pole citátov
 */
export interface ServiceResponse {
  [index: number]: Quote
}

/*
 * Definícia špecifického typu radu pre simulované stredisko
 */
export type ServiceQueue = RemoteQueue<ServiceRequest, ServiceResponse>;

/*
 * ServiceCenter je objekt ktorý vykonáva simuláciu spracovanie požiadaviek.
 * Získa citáty a vráti ich is požadovaným zdžaním ako simulácia doby vybavovania
 * požiadaviek
 */
export class ServiceCenter implements IServiceCenter<ServiceRequest, ServiceResponse> {

  constructor(private configStore: ServiceConfigurationStore) { }

  @rpc
  async serve(request: ServiceRequest): Promise<ServiceResponse> {
    debugService('serving request %o', request);
    // Pomocná asynchrónna funkcia pre čakanie
    const sleep = (time: number): Promise<void> => {
      return new Promise((resolve) => setTimeout(resolve, time * 1000));
    }

    // Získanie aktuálnej konfigurácie služieb
    const conf = await this.configStore.get();

    // Výpočet náhodnej doby čakania
    // - meanServiceTime je parameter "t" zo zadania
    // - serviceTimeDeviation je parameter "r" zo zadania
    const minDelay = Math.max(0, conf.meanServiceTime - conf.serviceTimeDeviation);
    const maxDelay = (conf.meanServiceTime + conf.serviceTimeDeviation);
    const delay = Math.random() * (maxDelay - minDelay) + minDelay;

    // Vráti citáty po uplynutí doby čakania
    const response = (await Promise.all([await fetchRandomQuotes(request.count), sleep(delay)]))[0];
    return response;
  }
}

