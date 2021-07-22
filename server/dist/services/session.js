"use strict";
/*
 * Modul session definuje dáta ktoré sa ukladajú pre užívateľské relácie
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSessionStore = void 0;
const session_store_1 = require("./lib/session-store");
/*
 * Factory pre sklad relácií
 */
function createSessionStore() {
    return new session_store_1.SessionStore();
}
exports.createSessionStore = createSessionStore;
//# sourceMappingURL=session.js.map