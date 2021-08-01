import debug from 'debug';
import { rpc } from '../rpc';
const debugPool = debug('pool');

export type QueueFactory<Q extends IManagedQueue> = (id: number) => Promise<Q>

export interface IManagedQueue {
  length(): Promise<number>;
  destroy(): Promise<void>
}

export class QueueManager<Q extends IManagedQueue> {
  private queueProms: Promise<Q>[] = [];

  constructor(private queueFactory: QueueFactory<Q>) { }

  protected async allocateQueue(maxNumberOfQueues: number): Promise<Q> {
    if (maxNumberOfQueues <= 0) throw new Error('Invadlid parameter maxNumberOfQueues');

    // Ak môžeme vytvoriť ďalšiu frontu tak ju vytvoríme
    if (this.queueProms.length < maxNumberOfQueues) {
      const id = this.queueProms.length;
      debugPool('creating queue %o', id);
      const q = this.queueFactory(id);
      this.queueProms.push(q)
      return q;
    }

    // Nájdi frontu s najmenším počtom požiadaviek...
    let minLength = 0;
    let minQueue = null;

    // Počet front ktoré prehľadávame je počet aktuálnych front, ale nie viac než maximálny
    // počet front (ten sa môže dynamicky meniť zmenou konfigurácie počas prevázky servera).
    const numberOfQueues = Math.min(this.queueProms.length, maxNumberOfQueues);


    // Prehľadaj fronty
    for (let i = 0; i < numberOfQueues; ++i) {

      const queue = await this.queueProms[i];
      const queueLength = await queue.length();

      // Ak sme na prvej fronte, tak jej dĺžka je zároveň najmenšou dĺžkou z prehľadaných front
      if (i == 0) {
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
    return this.queueProms[index];
  }


  /*
   * Odstránenie nepotrebných front
   *
   * Ak sa dynamicky zmení konfigurácia servera, tak sa môže znížiť maximálny počet front.
   * Táto metóda prechádza nadbytočné fronty a ruší ich, ale iba v prípade že už neobsahujú
   * žiadne čakajúce požiadavky.
   */
  protected async destroyStaleQueues(maxNumberOfQueues: number) {
    while (this.queueProms.length > maxNumberOfQueues) {

      // Zisti či je posledná z nadbytočných front prázdna, ak nie tak ukonči hľadanie.
      // Pre jednoduchosť sa odoberajú fronty iba z konca poľa
      const queue = await this.queueProms[this.queueProms.length - 1];
      if (await queue.length() > 0) {
        break;
      }
      // Odstránenie zo zoznamu a zničenie frontu
      debugPool('removing stale queue %o', this.queueProms.length - 1);
      this.queueProms.pop();
      await this.destroyQueue(queue);
    }
  }

  /*
   * Odstránenie všetkých front
   */
  async destroyAllQueues() {
    const queues = await Promise.all(this.queueProms);
    await Promise.all(queues.map(queue => this.destroyQueue(queue)));
    this.queueProms = [];
  }

  @rpc
  async count() {
    return this.queueProms.length;
  }

  protected async destroyQueue(queue: Q) {
    return queue.destroy();
  }

  protected async getQueueList(): Promise<Q[]> {
    return Promise.all(this.queueProms);
  }
}
