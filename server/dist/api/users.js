"use strict";
/*
 * Api route pre menežovanie užívateľov
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
const authenticate_1 = require("../middleware/authenticate");
function default_1(server) {
    const router = express_1.default.Router({ mergeParams: true });
    /*
     * Registrácia užívateľa
     */
    router.post('/register', (req, res) => __awaiter(this, void 0, void 0, function* () {
        // Validácia parametra username
        const username = req.body.username;
        if (!username) {
            return res.status(400).send({ error: 'username parameter is required' });
        }
        // Vytvorenie novej relácie pre užívateľa
        const sid = yield server.sessionStore().createSession({ username });
        // Pokiaľ sa nejedná o simuláciu, tak vráť identifikátor cez header cookie
        if (!req.body.simulate) {
            authenticate_1.setSessionCookie(req, res, sid);
        }
        // Pošli odpoveď
        res.send({
            sid
        });
    }));
    /*
     * Odhlásenie užívateľa
     */
    router.post('/logout', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            const session = req.session;
            if (session) {
                yield server.sessionStore().destroySession(session.sid);
            }
            res.send({
                message: 'success'
            });
        }
        catch (err) {
            next(err);
        }
    }));
    /*
     * Získanie mena autentifikovaného užívateľa
     */
    router.get('/current', (req, res) => {
        const session = req.session;
        if (session) {
            res.send({ username: session.data.username });
        }
        else {
            // ak nie je session, tak užívateľ nie je autentifikovaný
            res.status(404).send({ error: 'Session not found' });
        }
    });
    return router;
}
exports.default = default_1;
//# sourceMappingURL=users.js.map