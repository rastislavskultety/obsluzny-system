/*
 * Ukladací priestor pre údaje užívateľských reláciách
 */

import { v4 as uuidv4 } from 'uuid';
import { RedisStore, storeKeys } from './redis-store';


/*
 * Trieda pre ukladanie údajov užívateľských relácií
 */
export class SessionStore<T> {

  constructor(private store: RedisStore) { }

  /*
   * Vytvorenie relácie
   *
   * Asynchrónnosť je tu aby sa mohlo v budúcnosti prejsť na externú databázu
   */
  async createSession(data: T): Promise<string> {
    const sid = uuidv4();
    this.store.call('sadd', storeKeys.session, sid);
    this.store.call('set', storeKeys.sessionDataPrefix + sid, JSON.stringify(data));
    return sid;
  }

  /*
   * Zrušenie relácie
   *
   * Asynchrónnosť je tu aby sa mohlo v budúcnosti prejsť na externú databázu
   */
  async destroySession(sid: string) {
    return Promise.all([
      this.store.call('srem', storeKeys.session, sid),
      this.store.call('del', storeKeys.sessionDataPrefix + sid, sid)
    ]);
  }

  /*
   * Zistiť či existuje relácia
   *
   * Asynchrónnosť je tu aby sa mohlo v budúcnosti prejsť na externú databázu
   */
  async sessionExists(sid: string): Promise<boolean> {
    if (typeof sid !== 'string') throw new Error(`Invalid sid ${sid}`);
    return 1 === await this.store.call('sismember', storeKeys.session, sid);
  }


  /*
   * Získanie uložených údajov relácie
   *
   * Asynchrónnosť je tu aby sa mohlo v budúcnosti prejsť na externú databázu
   */
  async getSessionData(sid: string): Promise<T> {
    const data = await this.store.call('get', storeKeys.sessionDataPrefix + sid);
    if (data === null) throw new Error('Session not found');
    return JSON.parse(data);
  }

  /*
   * Počet uložených relácií
   *
   * Asynchrónnosť je tu aby sa mohlo v budúcnosti prejsť na externú databázu
   */
  async count(): Promise<number> {
    return this.store.call('scard', storeKeys.session);
  }
}
