"use strict";
/*
 * Ukladací priestor pre údaje užívateľských reláciách
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionStore = void 0;
const uuid_1 = require("uuid");
/*
 * Trieda pre ukladanie údajov užívateľských relácií
 */
class SessionStore {
    constructor() {
        // Relácie sú uložené v mape
        this.sessions = new Map();
    }
    /*
     * Vytvorenie relácie
     *
     * Asynchrónnosť je tu aby sa mohlo v budúcnosti prejsť na externú databázu
     */
    createSession(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const sid = uuid_1.v4();
            this.sessions.set(sid, data);
            return sid;
        });
    }
    /*
     * Zrušenie relácie
     *
     * Asynchrónnosť je tu aby sa mohlo v budúcnosti prejsť na externú databázu
     */
    destroySession(sid) {
        return __awaiter(this, void 0, void 0, function* () {
            this.sessions.delete(sid);
        });
    }
    /*
     * Zistiť či existuje relácia
     *
     * Asynchrónnosť je tu aby sa mohlo v budúcnosti prejsť na externú databázu
     */
    sessionExists(sid) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.sessions.has(sid);
        });
    }
    /*
     * Získanie uložených údajov relácie
     *
     * Asynchrónnosť je tu aby sa mohlo v budúcnosti prejsť na externú databázu
     */
    getSessionData(sid) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = this.sessions.get(sid);
            if (typeof data === 'undefined')
                throw new Error('Session not found');
            return data;
        });
    }
    /*
     * Počet uložených relácií
     *
     * Asynchrónnosť je tu aby sa mohlo v budúcnosti prejsť na externú databázu
     */
    count() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.sessions.size;
        });
    }
}
exports.SessionStore = SessionStore;
//# sourceMappingURL=session-store.js.map