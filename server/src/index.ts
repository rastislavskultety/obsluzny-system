/*
 * HTTP server založený na Express.js
 */

import express from "express";
import cookieParser from 'cookie-parser';

// Middleware
import log from "./middleware/log";
import authenticate from "./middleware/authenticate";
import serviceConfiguration from "./middleware/service-configuration";

// API routes
import users from './api/users';
import config from './api/config';
import stats from './api/stats';
import quotes from './api/quotes';

// Business logika
import Server from './services/server';

// Konfigurácia aplikácie
import configuration from "./configuration";


console.log('DEBUG', process.env.DEBUG)
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
app.use(serviceConfiguration(server)); // aktuálne parametre služieb -> req.serviceConfiguration

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
