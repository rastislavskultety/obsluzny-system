"use strict";
/*
 * Fronta pre spracovanie požiadaviek
 *
 * Fronta má priradené stredisko ktoré vybavuje požiadavky.
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
exports.Queue = void 0;
/*
 * Trieda pre frontu požiadaviek.
 *
 * Požiadavky sa vkladajú do fronty až do naplnenia kapacity. Požiadavka čaká vo fronte až kým nie
 * je spracovaná strediskom a potom sa uvoľní z fronty. Fronta pracuje ako FIFO rad.
 */
class Queue {
    // Konštruktor, id je identifikátor požiadavky
    constructor(id, center) {
        this.id = id;
        // Časová známka ktorá sa používa pre výpočet doby obsadenosti/neobsadenosti strediska
        this.lastTimestamp = Date.now();
        // Indikátor obsadenosti strediska
        this.serviceIsBusy = false;
        // Monitorovacie údaje fronty
        this.stats = {
            completedRequests: 0,
            rejectedRequests: 0,
            serviceBusyTime: 0,
            serviceIdleTime: 0,
            totalWaitTime: 0
        };
        // Interná štruktúra radu pre vybavovanie požiadaviek
        this.queue = [];
        this.serviceCenter = center;
    }
    /*
     * Zničenie fronty
     *
     * V odvodených triedach by tu mohlo byť vymazanie perzistných informácií (napr. z redis databázy)
     */
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            this.queue = [];
        });
    }
    /*
     * Pridanie požiadavky do fronty.
     *
     * Kapacita fronty sa môže  meniť zmenou dynamickou zmenou konfigurácie servera.
     */
    enqueue(request, capacity) {
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
                this.startService();
            }
        });
    }
    /*
     * Spustenie spracovávania požiadaviek - zoberie požiadavku ktorá je na rade a spracuje ju
     */
    startService() {
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
    next() {
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
                this.next();
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
    length() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queue.length;
        });
    }
    /*
     * Získanie monitorovacích údajov fronty
     *
     * Poznámka: asynchronnosť je tu pre budúce rozšírenia triedy
     */
    getStats() {
        return __awaiter(this, void 0, void 0, function* () {
            // Korekcia doby obsadenia strediska vzhľadom na aktuálny čas, pretože
            // sa aktualizuje iba pri spracovaní požiadavky
            let serviceBusyTime = this.stats.serviceBusyTime;
            let serviceIdleTime = this.stats.serviceIdleTime;
            const correction = Date.now() - this.lastTimestamp;
            if (this.serviceIsBusy) {
                serviceBusyTime += correction;
            }
            else {
                serviceIdleTime += correction;
            }
            return Object.assign({}, this.stats, {
                serviceBusyTime,
                serviceIdleTime,
                queuedRequests: this.queue.length
            });
        });
    }
    /*
     * Vynulovanie monitorovacích údajov fronty
     *
     * Poznámka: asynchronnosť je tu pre budúce rozšírenia triedy
     */
    resetStats() {
        return __awaiter(this, void 0, void 0, function* () {
            this.stats.completedRequests =
                this.stats.rejectedRequests =
                    this.stats.serviceBusyTime =
                        this.stats.serviceIdleTime =
                            this.stats.totalWaitTime = 0;
        });
    }
}
exports.Queue = Queue;
//# sourceMappingURL=queue.js.map