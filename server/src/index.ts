/*
 * HTTP server založený na Express.js
 *
 * Nastavenie DEBUG environmentálnej premennej:
 *   http         - logovanie http požiadaviek
 *   services     - logovanie business logiky
 *   transport    - logovanie tranportnej vrstvy
 *   channel      - logovanie kanálu = socket
 *   rpc          - logovanie rpc volaní
 *   center       - logovanie service center
 *   worker       - logovanie worker threads
 */

import express from "express";
import cookieParser from 'cookie-parser';

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

// Vytvorenie http servera express
const app = express();
const port = configuration?.server?.port || 8080; // default port to listen

// Vytvorenie servera pre aplikačnú logiku
const server = new Server();

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
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${port}`);
});
