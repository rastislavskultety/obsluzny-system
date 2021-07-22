"use strict";
/*
 * QueuePool menežuje fronty a prideľuje ich novým požiadavkam.
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
exports.QueuePool = void 0;
/*
 * QueuePool menežuje fronty a prideľuje ich novým požiadavkam.
 */
class QueuePool {
    constructor(queueFactory) {
        this.queueFactory = queueFactory;
        this.queues = []; // pole obsahuje všetky vytvorené fronty
    }
    /*
     * Pridelenie novej fronty pre požiadavku.
     *
     * Pridelenie fronty funguje takto:
     * - ak sa nedosiahol limit počtu front, tak sa vytvorí nová fronta
     * - inak sa vyhľadá fronta s najnižším počtom požiadaviek
     * - ak majú všetky fronty rovnaký počet požiadaviek, tak sa vyberie náhodná fronta
     */
    allocateQueue(maxNumberOfQueues) {
        return __awaiter(this, void 0, void 0, function* () {
            // Ak môžeme vytvoriť ďalšiu frontu tak ju vytvoríme
            if (this.queues.length < maxNumberOfQueues) {
                const id = this.queues.length;
                const queue = this.queueFactory(id);
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
                const queueLength = yield queue.length();
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
        });
    }
    /*
     * Odstránenie nepotrebných front
     *
     * Ak sa dynamicky zmení konfigurácia servera, tak sa môže znížiť maximálny počet front.
     * Táto metóda prechádza nadbytočné fronty a ruší ich, ale iba v prípade že už neobsahujú
     * žiadne čakajúce požiadavky.
     */
    destroyStaleQueues(maxNumberOfQueues) {
        return __awaiter(this, void 0, void 0, function* () {
            while (this.queues.length > maxNumberOfQueues) {
                // Zisti či je posledná z nadbytočných front prázdna, ak nie tak ukonči hľadanie.
                // Pre jednoduchosť sa odoberajú fronty iba z konca poľa
                const queue = this.queues[this.queues.length - 1];
                if ((yield queue.length()) > 0) {
                    break;
                }
                // Zničenie frontu a odstránenie zo zoznamu
                yield queue.destroy();
                this.queues.pop();
            }
        });
    }
    /*
     * Odstránenie včetkých front
     */
    destroyAllQueues() {
        return __awaiter(this, void 0, void 0, function* () {
            this.queues.forEach((q) => __awaiter(this, void 0, void 0, function* () { return yield q.destroy(); }));
            this.queues = [];
        });
    }
    /*
     * Počet vytvorených front
     */
    count() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queues.length;
        });
    }
    /*
     * Iterácia všetkých front
     */
    forEachQueue(callback) {
        this.queues.forEach(callback);
    }
}
exports.QueuePool = QueuePool;
//# sourceMappingURL=queue-pool.js.map