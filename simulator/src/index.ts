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
import http from 'http';
import { Server } from 'socket.io';
import { Simulator } from './simulator';
import configuration from './configuration';

// Port pre http server
const port = configuration.port || 3000;

// Vytvorenie servera
const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Vytvorenie simulátora
const simulator = new Simulator(configuration.urlPrefix, io, configuration);

// Počet aktívnych spojení
let connectionCount = 0;

// Spracovanie nových pripojení
io.on('connection', socket => {
  connectionCount += 1;

  if (configuration.logging) {
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
    if (configuration.logging) {
      // tslint:disable-next-line:no-console
      console.log(`Disconnect (remaining ${connectionCount} open connections)`);
    }

    // Ak nie sú žiadne spojenia tak je simulácia ukončená
    if (connectionCount === 0) {
      simulator.stop();
    }
  })
});

// Spustenie servera
httpServer.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`server is listening on http://localhost:${port}`);
});
