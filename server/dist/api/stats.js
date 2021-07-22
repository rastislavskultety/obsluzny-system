"use strict";
/*
 * Api route pre monitorovanie servera
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
function state(server) {
    const router = express_1.default.Router({ mergeParams: true });
    /*
     * Získanie aktuálnych monitorovacích údajov servera
     */
    router.get('/', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const stats = yield server.getStats();
            res.send(yield server.getStats());
        }
        catch (err) {
            next(err);
        }
    }));
    /*
     * Vynulovanie aktuálnych monitorovacích údajov servera
     */
    router.delete('/', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            yield server.resetStats();
            res.send({ message: 'success' });
        }
        catch (err) {
            next(err);
        }
    }));
    return router;
}
exports.default = state;
//# sourceMappingURL=stats.js.map