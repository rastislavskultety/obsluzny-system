/*
 * Modul session definuje dáta ktoré sa ukladajú pre užívateľské relácie
 */

import { SessionStore } from "./lib/session-store"

export interface SessionData {
  username: string;
}

/*
 * Factory pre sklad relácií
 */
export function createSessionStore(): SessionStore<SessionData> {
  return new SessionStore<SessionData>();
}
