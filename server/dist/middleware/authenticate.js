"use strict";
/*
 * Middleware pre autentifikáciu
 *
 * Autentikuje sa pomocou identifikátoru relácie sid, ktorý je uložený ako cookie v headeri,
 * alebo ako query v url (sid=...), alebo v tele http požiadavky ({ sid="..." }).
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
exports.authenticate = exports.setSessionCookie = void 0;
/*
 * Pomocník pre nastavenie cookie s novým sid
 */
function setSessionCookie(req, res, sid) {
    res.cookie('sid', sid, {
        signed: req.signedCookies ? true : false,
        httpOnly: true,
        sameSite: true,
        // maxAge: 10000000,  // maxAge spraví cookie perzistentným
        // secure: true   // cookie bude posielaný iba cez https
    });
}
exports.setSessionCookie = setSessionCookie;
/*
 * Middleware hook
 *
 * Vráti funkciu s express handlerom
 */
function authenticate(server) {
    return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            // Získaj sid z jedného z možných zdrojov query/body/cookie, pričom query má najväčšiu
            // prioritu a cookie najmenšiu
            const sid = req.query.sid ||
                req.body.sid ||
                (req.signedCookies ? req.signedCookies.sid : (req.cookies && req.cookies.sid));
            // Over existenciu cookie
            if (yield server.sessionStore().sessionExists(sid)) {
                // Získaj uložené dáta o relácii
                const data = yield server.sessionStore().getSessionData(sid);
                // Vlož ako nový element .session do požiadavky, aby si ho mohli nájsť api routery
                req.session = { sid, data };
            }
            next(); // pokračuj ďalším handlerom
        }
        catch (err) {
            next(err); // spracuj chybu štandardným spôsobom v expresse
        }
    });
}
exports.authenticate = authenticate;
exports.default = authenticate;
//# sourceMappingURL=authenticate.js.map