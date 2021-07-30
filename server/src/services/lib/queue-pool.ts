/*
 * QueuePool menežuje fronty a prideľuje ich novým požiadavkam.
 */

/*
 * Interface pre frontu.
 *
 * Definuje tu metódy ktoré využíva QueuePool. Predpokladá sa že fronta funguje asynchrónne,
 * napríklad môže byť na inom serveri, ale táto implementácia by mohla fungovať aj synchrónne.
 */
export interface IQueue {
  length: () => Promise<number>;
  destroy: () => Promise<void>;
}

/*
 * Definícia factory pre vytváranie nových front. Každá fronta je identifikovaná celým číslom.
 */
export type QueueFactory<T extends IQueue> = (id: number) => Promise<T>;


/*
 * QueuePool menežuje fronty a prideľuje ich novým požiadavkam.
 */
export class QueuePool<T extends IQueue> {

  private queues: T[] = []; // pole obsahuje všetky vytvorené fronty

  constructor(private queueFactory: QueueFactory<T>) { }

  /*
   * Pridelenie novej fronty pre požiadavku.
   *
   * Pridelenie fronty funguje takto:
   * - ak sa nedosiahol limit počtu front, tak sa vytvorí nová fronta
   * - inak sa vyhľadá fronta s najnižším počtom požiadaviek
   * - ak majú všetky fronty rovnaký počet požiadaviek, tak sa vyberie náhodná fronta
   */
  async allocateQueue(maxNumberOfQueues: number): Promise<T> {
    // Ak môžeme vytvoriť ďalšiu frontu tak ju vytvoríme
    if (this.queues.length < maxNumberOfQueues) {
      const id = this.queues.length;
      const queue = await this.queueFactory(id);
      this.queues.push(queue);
      return queue;
    }

    // Nájdi frontu s najmenším počtom požiadaviek...
    let minLength = 0;
    let minQueue = null;

    // Počet front ktoré prehľadávame je počet aktuálnych front, ale nie viac než maximálny
    // počet front (ten sa môže dynamicky meniť zmenou konfigurácie počas prevázky servera).
    const numberOfQueues = Math.min(this.queues.length, maxNumberOfQueues);

    // Prehľadaj fronty
    for (let i = 0; i < numberOfQueues; ++i) {
      const queue = this.queues[i];
      const queueLength = await queue.length();

      // Ak sme na prvej fronte, tak jej dĺžka je zároveň najmenšou dĺžkou z prehľadaných front
      if (i === 0) {
        minLength = queueLength;
      }

      // AK je dĺžka fronty menšia než minLength, tak je vybraná ako najkratšia fronta
      if (queueLength < minLength) {
        minLength = queueLength;
        minQueue = queue;
      }
    }

    // Ak sa našla najkratšiu frontu tak sa vráti ako výsledok
    if (minQueue) {
      return minQueue;
    }

    // Ak neexistuje fronta ktorý má menší počet požiadaviek než ostatné, tak všetky fronty majú rovnaký počet
    // požiadaviek a preto vyberieme náhodnú frontu
    const index = Math.floor(Math.random() * numberOfQueues);
    return this.queues[index];
  }

  /*
   * Odstránenie nepotrebných front
   *
   * Ak sa dynamicky zmení konfigurácia servera, tak sa môže znížiť maximálny počet front.
   * Táto metóda prechádza nadbytočné fronty a ruší ich, ale iba v prípade že už neobsahujú
   * žiadne čakajúce požiadavky.
   */
  async destroyStaleQueues(maxNumberOfQueues: number) {
    while (this.queues.length > maxNumberOfQueues) {
      // Zisti či je posledná z nadbytočných front prázdna, ak nie tak ukonči hľadanie.
      // Pre jednoduchosť sa odoberajú fronty iba z konca poľa
      const queue = this.queues[this.queues.length - 1];
      if (await queue.length() > 0) {
        break;
      }
      // Odstránenie zo zoznamu a zničenie frontu
      this.queues.pop();
      await queue.destroy();
    }
  }

  /*
   * Odstránenie včetkých front
   */
  async destroyAllQueues() {
    this.queues.forEach(async q => await q.destroy());
    this.queues = [];
  }

  /*
   * Počet vytvorených front
   */
  async count(): Promise<number> {
    return this.queues.length;
  }

  /*
   * Iterácia všetkých front
   */
  forEachQueue(callback: (queue: T, index?: number, arr?: T[]) => void) {
    this.queues.forEach(callback)
  }

}
