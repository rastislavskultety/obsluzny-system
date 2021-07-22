/*
 * Api route pre menežovanie užívateľov
 */

import express from "express";
import ExtendedRequest from "../middleware/extended-request";
import { setSessionCookie } from "../middleware/authenticate";
import Server from "../services/server";

export default function (server: Server) {

  const router = express.Router({ mergeParams: true });

  /*
   * Registrácia užívateľa
   */
  router.post('/register', async (req, res) => {

    // Validácia parametra username
    const username = req.body.username;
    if (!username) {
      return res.status(400).send({ error: 'username parameter is required' });
    }

    // Vytvorenie novej relácie pre užívateľa
    const sid = await server.sessionStore().createSession({ username });

    // Pokiaľ sa nejedná o simuláciu, tak vráť identifikátor cez header cookie
    if (!req.body.simulate) {
      setSessionCookie(req, res, sid);
    }

    // Pošli odpoveď
    res.send({
      sid
    });
  });


  /*
   * Odhlásenie užívateľa
   */
  router.post('/logout', async (req, res, next) => {
    try {
      const session = (req as ExtendedRequest).session;

      if (session) {
        await server.sessionStore().destroySession(session.sid);
      }
      res.send({
        message: 'success'
      });
    } catch (err) {
      next(err)
    }
  });


  /*
   * Získanie mena autentifikovaného užívateľa
   */
  router.get('/current', (req, res) => {
    const session = (req as ExtendedRequest).session;
    if (session) {
      res.send({ username: session.data.username });
    } else {
      // ak nie je session, tak užívateľ nie je autentifikovaný
      res.status(404).send({ error: 'Session not found' });
    }
  });


  return router;
}
