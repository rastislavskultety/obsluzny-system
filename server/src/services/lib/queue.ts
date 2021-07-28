/*
 * Fronta pre spracovanie požiadaviek
 *
 * Fronta má priradené stredisko ktoré vybavuje požiadavky.
 */

import { Transport } from "./transport/transport";
import { IQueue } from "./queue-pool";
import { rpc } from './rpc';

/*
 * Položka vo fronte ktorá obsahuje požiadavku.
 */
interface QueueItem<Request, Response> {
  timestamp: number; // časová známka prijatia požiadavky do fronty
  resolve: (response: Response) => void; // callback cez ktorý sa vracia výsledok zo strediska
  reject: (reason?: any) => void; // callback cez ktorý sa vracia chyba pri spracovaní
  request: Request // užívateľská požiadavka ktorá je predaná stredisku na vybavenie
}

/*
 * Definícia rozhrania strediska, ktoré používa fronta na vybavovie požiadaviek
 */
export interface IServiceCenter<Request, Response> {
  serve: (request: Request) => Promise<Response>;
}


/*
 * Monitorovacie údaje ktoré menežuje fronta o požiadavkoch a o stredisku.
 */
export interface QueueStats {
  queuedRequests: number;
  completedRequests: number;
  rejectedRequests: number;
  serviceBusyTime: number;
  serviceIdleTime: number;
  totalWaitTime: number;
}

/*
 * Trieda pre frontu požiadaviek.
 *
 * Požiadavky sa vkladajú do fronty až do naplnenia kapacity. Požiadavka čaká vo fronte až kým nie
 * je spracovaná strediskom a potom sa uvoľní z fronty. Fronta pracuje ako FIFO rad.
 */
export class Queue<Request, Response>  {
  // Časová známka ktorá sa používa pre výpočet doby obsadenosti/neobsadenosti strediska
  private lastTimestamp: number = Date.now();

  // Indikátor obsadenosti strediska
  private serviceIsBusy = false;

  // Monitorovacie údaje fronty
  private stats = {
    completedRequests: 0,
    rejectedRequests: 0,
    serviceBusyTime: 0,
    serviceIdleTime: 0,
    totalWaitTime: 0
  };

  // Referencia strediska ktoré vybavuje požiadavky
  private serviceCenter: IServiceCenter<Request, Response>;

  // Interná štruktúra radu pre vybavovanie požiadaviek
  private queue: QueueItem<Request, Response>[] = [];

  // Konštruktor, id je identifikátor požiadavky
  constructor(public id: number, center: IServiceCenter<Request, Response>) {
    this.serviceCenter = center;
  }


  @rpc
  getId() {
    return this.id;
  }
  /*
   * Pridanie požiadavky do fronty.
   *
   * Kapacita fronty sa môže  meniť zmenou dynamickou zmenou konfigurácie servera.
   */
  @rpc enqueue(request: Request, capacity: number): Promise<Response> {
    // Ak je fronta plná, vytvor výnimku
    if (this.queue.length >= capacity) {
      this.stats.rejectedRequests += 1;
      throw new Error('Queue capacity exceeded');
    }

    // Vloženie požiadavky do radu
    return new Promise((resolve, reject) => {
      this.queue.push({ timestamp: Date.now(), resolve, reject, request });

      // Ak po vložení je dĺžka fronty = 1, znamená to že žiadna požiadavka nie je spracovávaná
      // a preto sa spustí spracovanie
      if (this.queue.length === 1) {
        this.startService()
      }
    });
  }

  /*
   * Spustenie spracovávania požiadaviek - zoberie požiadavku ktorá je na rade a spracuje ju
   */
  private startService() {
    // Aktualizuj čas nečinnosti strediska
    const initialTimestamp = Date.now();
    this.stats.serviceIdleTime += initialTimestamp - this.lastTimestamp;
    this.lastTimestamp = initialTimestamp;

    // Spracuj požiadavku ktorá je na rade
    this.next();
  }

  /*
   * Spracovanie požiadavky ktorá je na rade
   */
  private next() {
    // Nastav, že stredisko je obsadené
    this.serviceIsBusy = true;

    // Prvá požiadavka vo fifo fronte
    const current = this.queue[0];

    // Pošli požiadavku do strediska na spracovanie
    this.serviceCenter.serve(current.request)
      .then(current.resolve)
      .catch(current.reject)
      .finally(() => {
        // Aktualizuj čas obsadenia servisného centra
        this.stats.completedRequests += 1;
        const currentTimestamp = Date.now();
        this.stats.serviceBusyTime += currentTimestamp - this.lastTimestamp;
        this.stats.totalWaitTime += currentTimestamp - current.timestamp;

        // Odstráň spracovanú požiadavku z fronty
        this.queue.shift();

        // Aktualizuj časovú známku pre výpočet doby obsadenia/neobsadenia strediska
        this.lastTimestamp = currentTimestamp;

        // Ak existuje ďalšia požiadavka vo fronte, tak ju spracuj
        if (this.queue.length) {
          this.next()
        }
        else {
          // Ak neexistuje ďalšia požiadavka, tak nastav, že stredisko je neobsadené
          this.serviceIsBusy = false;
        }
      });
  }

  /*
   * Dĺžka fronty
   *
   * Poznámka: asynchronnosť je tu pre budúce rozšírenia triedy
   */
  @rpc length(): number {
    return this.queue.length;
  }

  /*
   * Získanie monitorovacích údajov fronty
   *
   * Poznámka: asynchronnosť je tu pre budúce rozšírenia triedy
   */
  @rpc getStats(): QueueStats {
    // Korekcia doby obsadenia strediska vzhľadom na aktuálny čas, pretože
    // sa aktualizuje iba pri spracovaní požiadavky
    let serviceBusyTime = this.stats.serviceBusyTime;
    let serviceIdleTime = this.stats.serviceIdleTime;
    const correction = Date.now() - this.lastTimestamp;
    if (this.serviceIsBusy) {
      serviceBusyTime += correction;
    } else {
      serviceIdleTime += correction;
    }

    return Object.assign(
      {},
      this.stats,
      {
        serviceBusyTime,
        serviceIdleTime,
        queuedRequests: this.queue.length
      });
  }

  /*
   * Vynulovanie monitorovacích údajov fronty
   *
   * Poznámka: asynchronnosť je tu pre budúce rozšírenia triedy
   */
  @rpc resetStats() {
    this.stats.completedRequests =
      this.stats.rejectedRequests =
      this.stats.serviceBusyTime =
      this.stats.serviceIdleTime =
      this.stats.totalWaitTime = 0;
  }
}
