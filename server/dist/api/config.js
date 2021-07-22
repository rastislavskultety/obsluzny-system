"use strict";
/*
 * Api route pre konfiguráciu služieb
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
function config(server) {
    const router = express_1.default.Router({ mergeParams: true });
    /*
     * Vrátenie aktuálnej konfigurácie
     */
    router.get('/', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            res.send(yield server.getServiceConfiguration());
        }
        catch (err) {
            next(err);
        }
    }));
    /*
     * Nastavenie novej konfigurácie
     */
    router.post('/', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (utils_1.handleInvalidParameter(req, res, 'numberOfQueues', 'integer'))
                return;
            if (utils_1.handleInvalidParameter(req, res, 'queueCapacity', 'integer'))
                return;
            if (utils_1.handleInvalidParameter(req, res, 'meanServiceTime', 'float'))
                return;
            if (utils_1.handleInvalidParameter(req, res, 'serviceTimeDeviation', 'float'))
                return;
            const conf = {
                numberOfQueues: req.body.numberOfQueues,
                queueCapacity: req.body.queueCapacity,
                meanServiceTime: req.body.meanServiceTime,
                serviceTimeDeviation: req.body.serviceTimeDeviation,
            };
            yield server.setServiceConfiguration(conf);
            res.send({ message: 'success' });
        }
        catch (err) {
            next(err);
        }
    }));
    return router;
}
exports.default = config;
//# sourceMappingURL=config.js.map