/*
 * Middleware pre získanie konfigurácie služieb
 *
 * Pretože tieto konfigurácia služieb je dynamická, tak je získaná a uložená do každej http požiadavky
 * kde jú potom môžu nájsť api routery.
 */

import express from "express";
import Server from "../services/server";
import ExtendedRequest from "./extended-request";

export default function serviceConfiguration(server: Server) {
  const handler: express.RequestHandler = async (req, res, next) => {
    try {
      const conf = await server.getServiceConfiguration();
      (req as ExtendedRequest).serviceConfiguration = conf;
      next();
    } catch (err) {
      next(err);
    }
  }
  return handler;
}


