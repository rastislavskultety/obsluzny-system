/*
 * Api route pre získanie citátov, t.j. hlavná služba tohto servera
 */

import express from "express";
import Server from "../services/server";
import { handleInvalidSession } from "./lib/utils";
import ExtendedRequest from '../middleware/extended-request';

export default function (server: Server) {
  const router = express.Router({ mergeParams: true });

  router.get('/', async (req, res, next) => {
    try {
      const countLimit = 1000;
      if (handleInvalidSession(req, res)) return;

      // Parameter count môže byť v url query alebo v tele http požiadavku

      const count = typeof req.query.count !== "undefined" && Number.parseInt(req.query.count.toString(), 10) ||
        req.body.count || 1;

      // Validácia parametra count
      if (!Number.isInteger(count)) {
        return res.status(400).send({ error: "Parameter count must be a number" })
      }
      if (count > countLimit) {
        return res.status(400).send({ error: "Parameter count must be less than " + countLimit })
      }

      const conf = (req as ExtendedRequest).serviceConfiguration; // Aktuálna konfigurácia služieb


      try {

        const pool = server.queuePool();

        // Získaj frontu pre uloženie požiadavky
        const queue = await pool.allocateQueue(conf.numberOfQueues);

        // Vloženie požidavku do fronty, vráti sa odozva zo služby
        const quotes = await queue.enqueue({ count }, conf.queueCapacity);

        // Údržba...
        await pool.destroyStaleQueues(conf.numberOfQueues);

        // Odoslanie odozvy
        res.send({ quotes, serviceCenter: queue.id + 1 });
      } catch (err) {

        // Ošetrenie chyby prekročenia kapacity fronty
        if (err.message === 'Queue capacity exceeded') {
          res.status(503).send({ error: err.message });
          return;
        } else {
          next(err); // štandardné spracovanie chyby
        }
      }

    } catch (err) {
      next(err);
    }
  });

  return router;
};

