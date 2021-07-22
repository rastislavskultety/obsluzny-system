"use strict";
/*
 * Api route pre získanie citátov, t.j. hlavná služba tohto servera
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const utils_1 = require("./lib/utils");
function default_1(server) {
    const router = express_1.default.Router({ mergeParams: true });
    router.get('/', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const countLimit = 1000;
            if (utils_1.handleInvalidSession(req, res))
                return;
            // Parameter count môže byť v url query alebo v tele http požiadavku
            const count = Number.parseInt((_a = req.query.count) === null || _a === void 0 ? void 0 : _a.toString(), 10) || req.body.count || 1;
            // Validácia parametra count
            if (!Number.isInteger(count)) {
                return res.status(400).send({ error: "Parameter count must be a number" });
            }
            if (count > countLimit) {
                return res.status(400).send({ error: "Parameter count must be less than " + countLimit });
            }
            const conf = req.serviceConfiguration; // Aktuálna konfigurácia služieb
            try {
                const pool = server.queuePool();
                // Získaj frontu pre uloženie požiadavky
                const queue = yield pool.allocateQueue(conf.numberOfQueues);
                // Vloženie požidavku do fronty, vráti sa odozva zo služby
                const quotes = yield queue.enqueue({ count }, conf.queueCapacity);
                // Údržba...
                yield pool.destroyStaleQueues(conf.numberOfQueues);
                // Odoslanie odozvy
                res.send({ quotes, serviceCenter: queue.id + 1 });
            }
            catch (err) {
                // Ošetrenie chyby prekročenia kapacity fronty
                if (err.message === 'Queue capacity exceeded') {
                    res.status(503).send({ error: err.message });
                    return;
                }
                else {
                    next(err); // štandardné spracovanie chyby
                }
            }
        }
        catch (err) {
            next(err);
        }
    }));
    return router;
}
exports.default = default_1;
;
//# sourceMappingURL=quotes.js.map