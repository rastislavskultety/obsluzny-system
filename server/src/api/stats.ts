/*
 * Api route pre monitorovanie servera
 */

import express from "express";
import Server from "../services/server";

export default function state(server: Server) {
  const router = express.Router({ mergeParams: true });

  /*
   * Získanie aktuálnych monitorovacích údajov servera
   */
  router.get('/', async (req, res, next) => {
    try {
      const stats = await server.getStats();
      res.send(await server.getStats())
    } catch (err) {
      next(err);
    }
  });

  /*
   * Vynulovanie aktuálnych monitorovacích údajov servera
   */
  router.delete('/', async (req, res, next) => {
    try {
      await server.resetStats();
      res.send({ message: 'success' });
    } catch (err) {
      next(err);
    }
  })

  return router;
}
