"use strict";
/*
 * Simulácia strediska pre vybavovanie požiadaviek
 *
 * Stredisko dostáva požiadavky na vrátenie záznamov z databázy citátov známych osobností.
 * Požiadavky špecifikujú počet citátov, ktoré požadujú v rámci jednej služby.
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
exports.ServiceCenter = void 0;
const quotes_1 = require("./lib/quotes");
const service_configuration_1 = require("./lib/service-configuration");
/*
 * ServiceCenter je objekt ktorý vykonáva simuláciu spracovanie požiadaviek.
 * Získa citáty a vráti ich is požadovaným zdžaním ako simulácia doby vybavovania
 * požiadaviek
 */
class ServiceCenter {
    serve(request) {
        return __awaiter(this, void 0, void 0, function* () {
            // Pomocná asynchrónna funkcia pre čakanie
            const sleep = (time) => {
                return new Promise((resolve) => setTimeout(resolve, time * 1000));
            };
            // Získanie aktuálnej konfigurácie služieb
            const conf = yield service_configuration_1.getConfiguration();
            // Výpočet náhodnej doby čakania
            // - meanServiceTime je parameter "t" zo zadania
            // - serviceTimeDeviation je parameter "r" zo zadania
            const minDelay = Math.max(0, conf.meanServiceTime - conf.serviceTimeDeviation);
            const maxDelay = (conf.meanServiceTime + conf.serviceTimeDeviation);
            const delay = Math.random() * (maxDelay - minDelay) + minDelay;
            // Vráti citáty po uplynutí doby čakania
            const response = (yield Promise.all([yield quotes_1.fetchRandomQuotes(request.count), sleep(delay)]))[0];
            return response;
        });
    }
}
exports.ServiceCenter = ServiceCenter;
//# sourceMappingURL=service.js.map