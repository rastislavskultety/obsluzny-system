"use strict";
/*
 * Databáza citátov známych osobností
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
exports.fetchRandomQuotes = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Cesta k json súboru obsahujúcemu citáty
const dataPath = path_1.default.resolve(__dirname, '../../data/quotes.json');
// Asynchrónne načítanie citátov
const quotesData = new Promise((resolve, reject) => {
    fs_1.default.readFile(dataPath, (err, data) => {
        if (err) {
            // tslint:disable-next-line:no-console
            console.error('Cannot read data file ', dataPath, ': ', err);
            reject(err);
        }
        try {
            const result = JSON.parse(data.toString());
            resolve(result);
        }
        catch (err) {
            // tslint:disable-next-line:no-console
            console.error('Cannot parse data file ', dataPath, ': ', err);
            reject(err);
        }
    });
});
/*
 * Zísanie poľa citátov náhodne vybraných z databázy
 *
 * Mohlo by byť spravené synchrónne, ale ak by sa databáza previedla napríklad na sql server,
 * tak by bolo asynchrónne spracovanie potrebné.
 */
function fetchRandomQuotes(count) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield quotesData;
        const result = [];
        for (let i = 0; i < count; ++i) {
            const index = Math.floor(Math.random() * data.length);
            result.push(data[index]);
        }
        return result;
    });
}
exports.fetchRandomQuotes = fetchRandomQuotes;
//# sourceMappingURL=quotes.js.map