"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Server pre vytváranie simulovaných http požiadaviek na hlavný http server
 *
 * Webová aplikácia komunikuje s týmto serverom pomocou websocket.
 *
 * Server odosiela nasledujúce správy:
 * - 'status', isRunning: boolean - stav simulácie, true ak je spustená
 * - 'log', message: string - informačná správa o priebehu simulácie
 * - 'error', message: string - informačná správa o chybe počas simulácie
 *
 * Klient odosiela nasledujúce správy:
 * - 'start', params: SimParams - spustenie simulácie s danými parametrami
 * - 'stop' - ukončenie simulácie
 */
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const simulator_1 = require("./simulator");
const configuration_1 = __importDefault(require("./configuration"));
// Port pre http server
const port = configuration_1.default.port || 3000;
// Vytvorenie servera
const httpServer = http_1.default.createServer();
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
// Vytvorenie simulátora
const simulator = new simulator_1.Simulator(configuration_1.default.urlPrefix, io, configuration_1.default);
// Počet aktívnych spojení
let connectionCount = 0;
// Spracovanie nových pripojení
io.on('connection', socket => {
    connectionCount += 1;
    if (configuration_1.default.logging) {
        // tslint:disable-next-line:no-console
        console.log(`New connection (totally ${connectionCount} open connections)`);
    }
    // Po prípojení sa hneď odosiela správa o stave simulácie
    socket.emit("status", simulator.isRunning());
    // Spracovanie požiadavky na spustenie simulácie
    socket.on("start", params => simulator.start(params));
    // Spracovanie požiadavky na ukončenie simulácie
    socket.on("stop", () => simulator.stop());
    // Ukončenie spojenia
    socket.on("disconnect", () => {
        connectionCount -= 1;
        if (configuration_1.default.logging) {
            // tslint:disable-next-line:no-console
            console.log(`Disconnect (remaining ${connectionCount} open connections)`);
        }
        // Ak nie sú žiadne spojenia tak je simulácia ukončená
        if (connectionCount === 0) {
            simulator.stop();
        }
    });
});
// Spustenie servera
httpServer.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server is listening on http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map