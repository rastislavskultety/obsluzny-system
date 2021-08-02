/*
 * Modul session definuje dáta ktoré sa ukladajú pre užívateľské relácie
 */

import { RedisStore } from "./lib/redis-store";
import { SessionStore } from "./lib/session-store"

export interface SessionData {
  username: string;
}

/*
 * Factory pre sklad relácií
 */
export function createSessionStore(store: RedisStore): SessionStore<SessionData> {
  return new SessionStore<SessionData>(store);
}
