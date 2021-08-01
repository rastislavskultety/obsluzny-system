/*
 * Api route pre získanie citátov, t.j. hlavná služba tohto servera
 */

import express from "express";
import Server from "../services/server";
import { handleInvalidSession } from "./lib/utils";

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

      try {

        const pool = server.queuePool;

        // Vloženie požidavku do fronty, vráti sa odozva zo služby
        const resp = await pool.enqueue({ count });

        // Odoslanie odozvy
        res.send({
          quotes: resp.response,
          serviceCenter: resp.serviceCenter
        });

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

