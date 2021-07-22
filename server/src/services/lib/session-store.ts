/*
 * Ukladací priestor pre údaje užívateľských reláciách
 */

import { v4 as uuidv4 } from 'uuid';


/*
 * Trieda pre ukladanie údajov užívateľských relácií
 */
export class SessionStore<T> {

  // Relácie sú uložené v mape
  private sessions = new Map<string, T>();

  /*
   * Vytvorenie relácie
   *
   * Asynchrónnosť je tu aby sa mohlo v budúcnosti prejsť na externú databázu
   */
  async createSession(data: T): Promise<string> {
    const sid = uuidv4();
    this.sessions.set(sid, data);
    return sid;
  }

  /*
   * Zrušenie relácie
   *
   * Asynchrónnosť je tu aby sa mohlo v budúcnosti prejsť na externú databázu
   */
  async destroySession(sid: string) {
    this.sessions.delete(sid);
  }

  /*
   * Zistiť či existuje relácia
   *
   * Asynchrónnosť je tu aby sa mohlo v budúcnosti prejsť na externú databázu
   */
  async sessionExists(sid: string): Promise<boolean> {
    return this.sessions.has(sid);
  }


  /*
   * Získanie uložených údajov relácie
   *
   * Asynchrónnosť je tu aby sa mohlo v budúcnosti prejsť na externú databázu
   */
  async getSessionData(sid: string): Promise<T> {
    const data = this.sessions.get(sid);
    if (typeof data === 'undefined') throw new Error('Session not found');
    return data;
  }

  /*
   * Počet uložených relácií
   *
   * Asynchrónnosť je tu aby sa mohlo v budúcnosti prejsť na externú databázu
   */
  async count(): Promise<number> {
    return this.sessions.size;
  }
}
