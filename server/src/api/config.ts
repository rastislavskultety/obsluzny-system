/*
 * Api route pre konfiguráciu služieb
 */

import express from "express";
import Server from "../services/server";
import { handleInvalidParameter } from "./lib/utils";

export default function config(server: Server) {
  const router = express.Router({ mergeParams: true });

  /*
   * Vrátenie aktuálnej konfigurácie
   */
  router.get('/', async (req, res, next) => {
    try {
      res.send(await server.serviceConfigurationStore.get());
    } catch (err) {
      next(err)
    }
  });

  /*
   * Nastavenie novej konfigurácie
   */
  router.post('/', async (req, res, next) => {
    try {
      if (handleInvalidParameter(req, res, 'numberOfQueues', 'integer')) return;
      if (handleInvalidParameter(req, res, 'queueCapacity', 'integer')) return;
      if (handleInvalidParameter(req, res, 'meanServiceTime', 'float')) return;
      if (handleInvalidParameter(req, res, 'serviceTimeDeviation', 'float')) return;

      const conf = {
        numberOfQueues: req.body.numberOfQueues,
        queueCapacity: req.body.queueCapacity,
        meanServiceTime: req.body.meanServiceTime,
        serviceTimeDeviation: req.body.serviceTimeDeviation,
      }
      await server.serviceConfigurationStore.set(conf);
      res.send({ message: 'success' });
    } catch (err) {
      next(err)
    }
  });

  return router;
}
