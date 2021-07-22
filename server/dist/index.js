"use strict";
/*
 * HTTP server založený na Express.js
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// Middleware
const log_1 = __importDefault(require("./middleware/log"));
const authenticate_1 = __importDefault(require("./middleware/authenticate"));
const service_configuration_1 = __importDefault(require("./middleware/service-configuration"));
// API routes
const users_1 = __importDefault(require("./api/users"));
const config_1 = __importDefault(require("./api/config"));
const stats_1 = __importDefault(require("./api/stats"));
const quotes_1 = __importDefault(require("./api/quotes"));
// Business logika
const server_1 = __importDefault(require("./services/server"));
// Konfigurácia aplikácie
const configuration_1 = __importDefault(require("./configuration"));
// Vytvorenie http servera express
const app = express_1.default();
const port = ((_a = configuration_1.default === null || configuration_1.default === void 0 ? void 0 : configuration_1.default.server) === null || _a === void 0 ? void 0 : _a.port) || 8080; // default port to listen
// Vytvorenie servera pre aplikačnú logiku
const server = new server_1.default();
/*
 * Štandardný middleware
 */
app.use(cookie_parser_1.default(configuration_1.default.server.security.cookieSecret)); // spracovanie cookies
app.use(express_1.default.json()); // parsovanie parametrov z html body
app.use(express_1.default.urlencoded({ extended: true })); // parsovanie parametrov z url query
/*
 * Aplikačný middleware
 */
if ((_b = configuration_1.default.server) === null || _b === void 0 ? void 0 : _b.logging) {
    app.use(log_1.default()); // logovanie požiadaviek
}
app.use(authenticate_1.default(server)); // autenifikácia -> req.session
app.use(service_configuration_1.default(server)); // aktuálne parametre služieb -> req.serviceConfiguration
// API routes
app.use("/api/users", users_1.default(server));
app.use("/api/quotes", quotes_1.default(server));
app.use('/api/config', config_1.default(server));
app.use('/api/stats', stats_1.default(server));
// Spustenie http servera
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server started at http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map