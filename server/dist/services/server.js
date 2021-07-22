"use strict";
/*
 * Server je objekt ktorý poskytuje business logiku a podporné služby pre api
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
exports.Server = void 0;
const queue_pool_1 = require("./lib/queue-pool");
const queue_1 = require("./lib/queue");
const service_configuration_1 = require("./lib/service-configuration");
const session_1 = require("./session");
const service_1 = require("./service");
/*
 * Servisné stredisko simuluje spracovanie požiadavok užívateľov.
 *
 * Táto implementácia vytvára službu ktorá vracia citáty známych osobnosti ktoré
 * sú náhodne vybrané z databázy.
 *
 * Všetky servisné centrá sú simulované jedným objektom.
 */
const serviceCenter = new service_1.ServiceCenter();
/*
 * Factory pre vytvárnie frontov požiadaviek pre jednotlivé strediská
 *
 * Každá fronta je identifikovaná parametrom id, čo je celé číslo.
 */
function queueFactory(id) {
    return new queue_1.Queue(id, serviceCenter);
}
/*
 * Server pre aplikačnú logiku
 */
class Server {
    constructor() {
        this._queuePool = new queue_pool_1.QueuePool(queueFactory);
        this._sessionStore = session_1.createSessionStore();
    }
    /*
     * queuePool menežuje fronty požiadaviek a prideľuje fronty podľa
     * aktuálnej obsadenosti všetkých frontov.
     */
    queuePool() {
        return this._queuePool;
    }
    /*
     * sessionStore umožňuje menežovanie aktuálnych relácií (sessions) užívateľov.
     */
    sessionStore() {
        return this._sessionStore;
    }
    /*
     * Získanie konfigurácie služieb (parametrov n, m, t, r zo zadania).
     *
     * Tieto parametre je možné dynamicky meniť počas prevádzky servera pomocou rest api.
     */
    getServiceConfiguration() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield service_configuration_1.getConfiguration();
        });
    }
    /*
     * Nastavenie novej konfigurácie služieb
     */
    setServiceConfiguration(conf) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield service_configuration_1.setConfiguration(conf);
        });
    }
    /*
     * Monitorovanie servera - získanie aktuálnych informácií.
     */
    getStats() {
        return __awaiter(this, void 0, void 0, function* () {
            const activeUsers = yield this._sessionStore.count();
            const numberOfQueues = yield this._queuePool.count();
            let queuedRequests = 0;
            let completedRequests = 0;
            let rejectedRequests = 0;
            let serviceBusyTime = 0;
            let serviceIdleTime = 0;
            let totalWaitTime = 0;
            const arr = [];
            this._queuePool.forEachQueue((queue) => arr.push(queue.getStats()));
            const queueStats = yield Promise.all(arr);
            queueStats.forEach(stats => {
                queuedRequests += stats.queuedRequests;
                completedRequests += stats.completedRequests;
                rejectedRequests += stats.rejectedRequests;
                serviceBusyTime += stats.serviceBusyTime;
                serviceIdleTime += stats.serviceIdleTime;
                totalWaitTime += stats.totalWaitTime;
            });
            const totalTime = serviceBusyTime + serviceIdleTime;
            const serviceUtilization = totalTime ? (serviceBusyTime / totalTime) : 0;
            const avgWaitingTime = completedRequests ? (totalWaitTime / completedRequests / 1000) : 0;
            return {
                activeUsers,
                numberOfQueues,
                queuedRequests,
                completedRequests,
                rejectedRequests,
                serviceUtilization,
                avgWaitingTime
            };
        });
    }
    /*
     * Vynulovanie monitorovacích údajov
     */
    resetStats() {
        return __awaiter(this, void 0, void 0, function* () {
            const arr = [];
            this._queuePool.forEachQueue((queue) => arr.push(queue.resetStats()));
            yield Promise.all(arr);
        });
    }
}
exports.Server = Server;
exports.default = Server;
//# sourceMappingURL=server.js.map