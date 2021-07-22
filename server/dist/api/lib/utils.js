"use strict";
/*
 * Pomocné funkcie pre api routery
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleInvalidParameter = exports.handleInvalidSession = void 0;
/*
 * Spracovanie neplatnej relácie
 *
 * Pokiaľ zistí že relácia (session) je neplatná, tak odošle chybovú odozvu
 *
 * Návratová hodnota: true ak funkcia odoslala chybovú odozvu (relácia bola neplatná), ináč false
 */
function handleInvalidSession(req, res) {
    const session = req.session;
    if (session) {
        return false;
    }
    else {
        res.status(401).send({ error: "Invalid session" });
        return true;
    }
}
exports.handleInvalidSession = handleInvalidSession;
/*
 * Spracovanie neplatných parametrov
 *
 * Overuje platnosť integer/float parametrov, ak nie je platný, tak odošle chybocú odozvu.
 *
 * Návratová hodnota: true ak funkcia odoslala chybovú odozvu (parameter bola neplatný), ináč false
 */
function handleInvalidParameter(req, res, param, type) {
    const value = req.body[param];
    // Test či je parameter prítomný
    if (typeof value === "undefined") {
        res.status(400).send({ error: 'Missing required parameter ' + param });
        return true;
    }
    // Over či je integer alebo float
    switch (type) {
        case 'integer':
            if (typeof value !== 'number' || !Number.isInteger(value)) {
                res.status(400).send({ error: `Parameter ${param} has to be an integer` });
                return true;
            }
            break;
        case 'float':
            if (typeof value !== 'number' || isNaN(value)) {
                res.status(400).send({ error: `Parameter ${param} has to be a number` });
                return true;
            }
            break;
    }
    return false; // Parameter je platný
}
exports.handleInvalidParameter = handleInvalidParameter;
//# sourceMappingURL=utils.js.map