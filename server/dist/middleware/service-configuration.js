"use strict";
/*
 * Middleware pre získanie konfigurácie služieb
 *
 * Pretože tieto konfigurácia služieb je dynamická, tak je získaná a uložená do každej http požiadavky
 * kde jú potom môžu nájsť api routery.
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
function serviceConfiguration(server) {
    const handler = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const conf = yield server.getServiceConfiguration();
            req.serviceConfiguration = conf;
            next();
        }
        catch (err) {
            next(err);
        }
    });
    return handler;
}
exports.default = serviceConfiguration;
//# sourceMappingURL=service-configuration.js.map