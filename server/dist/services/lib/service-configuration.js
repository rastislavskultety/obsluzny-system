"use strict";
/*
 * Parametre spracovania požiadaviek.
 *
 * Tieto parametre je možné dynamicky meniť počas behu serveru pomocou api
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
exports.setConfiguration = exports.getConfiguration = exports.configurationIsValid = exports.defaultConfiguration = void 0;
const configuration_1 = __importDefault(require("../../configuration"));
/*
 * Default parametre nastavené pri štarte servera.
 */
exports.defaultConfiguration = Object.assign({
    numberOfQueues: 10,
    queueCapacity: 5,
    meanServiceTime: 1.0,
    serviceTimeDeviation: 0.5
}, configuration_1.default.service);
/*
 * Aktuálne nastavenie parametrov
 */
const currentConfiguration = Object.assign({}, exports.defaultConfiguration);
/*
 * Test validity parametrov
 */
function configurationIsValid(config) {
    return Number.isInteger(config.numberOfQueues) &&
        config.numberOfQueues > 0 &&
        Number.isInteger(config.queueCapacity) &&
        config.queueCapacity > 0 &&
        config.meanServiceTime >= 0 &&
        config.serviceTimeDeviation >= 0;
}
exports.configurationIsValid = configurationIsValid;
/*
 * Získanie parametrov
 *
 * Asynchrónnosť je tu aby sa mohlo v budúcnosti prejsť na externú databázu
 */
function getConfiguration() {
    return __awaiter(this, void 0, void 0, function* () {
        return currentConfiguration;
    });
}
exports.getConfiguration = getConfiguration;
/*
 * Nastavenie parametrov
 *
 * Asynchrónnosť je tu aby sa mohlo v budúcnosti prejsť na externú databázu
 */
function setConfiguration(config) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!configurationIsValid(config))
            throw Error("Invalid configuration");
        Object.assign(currentConfiguration, config);
    });
}
exports.setConfiguration = setConfiguration;
//# sourceMappingURL=service-configuration.js.map