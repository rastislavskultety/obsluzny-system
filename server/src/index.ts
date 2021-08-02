/*
 * HTTP server založený na Express.js
 *
 * Nastavenie environmentálnej premennej DEBUG:
 *   http         - logovanie http požiadaviek
 *   service      - logovanie servisného strediska
 *   transport    - logovanie tranportnej vrstvy
 *   channel      - logovanie kanálu použitého v transporte
 *   socket       - logovanie soketov
 *   rpc          - logovanie rpc volaní
 *   center       - logovanie service center
 *   worker       - logovanie worker threads
 *   cluster      - logovanie clustra http serverov
 *   pool         - logovanie pool-u radov požiadaviek
 *   redis        - logovanie požiadaviek na redis server
 *   file         - logovanie prístupov na disk (konfiguračný súbor, databáza citátov)
 */

import express from "express";
import cookieParser from 'cookie-parser';
import cluster from 'cluster';
import { cpus } from 'os';
import debug from 'debug';

// Middleware
import log from "./middleware/log";
import authenticate from "./middleware/authenticate";

// API routes
import users from './api/users';
import config from './api/config';
import stats from './api/stats';
import quotes from './api/quotes';

// Business logika
import Server from './services/server';

// Konfigurácia aplikácie
import configuration from "./configuration";

import { startWorkerThreads } from "./services/workers";

const debugCluster = debug('cluster');

if (cluster.isPrimary) {
  startWorkerThreads(configuration)
    .then(startCluster)
    .catch(error => {
      // tslint:disable-next-line:no-console
      console.error('Cannot start worker threads: ', error);
      process.exit(1);
    });
} else {
  debugCluster('[%d] Started cluster worker', process.pid);
  startExpressServer();
}

function startCluster() {
  const clusterSize = configuration.clusterSize || cpus().length;

  if (clusterSize <= 1) {
    debugCluster('Starting single instance without clustering');
    startExpressServer();
  } else {
    // Fork workers.
    for (let i = 0; i < clusterSize; i++) {
      cluster.fork();
    }
    cluster.on('exit', (worker, code, signal) => {
      debugCluster('Cluster worker [%d] died with code %d', worker.process.pid, code);
    });
  }
}

function startExpressServer() {
  // Vytvorenie http servera express
  const app = express();
  const port = configuration?.server?.port || 8080; // default port to listen


  // Vytvorenie servera pre aplikačnú logiku
  const server = new Server(configuration);

  /*
   * Štandardný middleware
   */
  app.use(cookieParser(configuration.server.security.cookieSecret)); // spracovanie cookies
  app.use(express.json()); // parsovanie parametrov z html body
  app.use(express.urlencoded({ extended: true })); // parsovanie parametrov z url query

  /*
   * Aplikačný middleware
   */
  app.use(log());// logovanie požiadaviek
  app.use(authenticate(server)); // autenifikácia -> req.session

  // API routes
  app.use("/api/users", users(server));
  app.use("/api/quotes", quotes(server));
  app.use('/api/config', config(server));
  app.use('/api/stats', stats(server));

  // Spustenie http servera
  app.listen(port, () => {
    debugCluster('[%d] server started at http://localhost:%d', process.pid, port);
  });
}
