/*
 * Middleware pre autentifikáciu
 *
 * Autentikuje sa pomocou identifikátoru relácie sid, ktorý je uložený ako cookie v headeri,
 * alebo ako query v url (sid=...), alebo v tele http požiadavky ({ sid="..." }).
 */

import express from "express";
import Server from "../services/server";
import ExtendedRequest from "./extended-request";


/*
 * Pomocník pre nastavenie cookie s novým sid
 */
export function setSessionCookie(req: express.Request, res: express.Response, sid: string) {
  res.cookie('sid', sid, {
    signed: req.signedCookies ? true : false,
    httpOnly: true,
    sameSite: true,
    // maxAge: 10000000,  // maxAge spraví cookie perzistentným
    // secure: true   // cookie bude posielaný iba cez https
  });
}

/*
 * Middleware hook
 *
 * Vráti funkciu s express handlerom
 */
export function authenticate(server: Server) {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      // Získaj sid z jedného z možných zdrojov query/body/cookie, pričom query má najväčšiu
      // prioritu a cookie najmenšiu
      const sid = req.query.sid ||
        req.body.sid ||
        (req.signedCookies ? req.signedCookies.sid : (req.cookies && req.cookies.sid));

      // Over existenciu cookie
      if (await server.sessionStore.sessionExists(sid)) {
        // Získaj uložené dáta o relácii
        const data = await server.sessionStore.getSessionData(sid);

        // Vlož ako nový element .session do požiadavky, aby si ho mohli nájsť api routery
        (req as ExtendedRequest).session = { sid, data }
      }

      next(); // pokračuj ďalším handlerom
    } catch (err) {
      next(err); // spracuj chybu štandardným spôsobom v expresse
    }
  }
}

export default authenticate;
