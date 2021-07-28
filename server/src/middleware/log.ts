/*
 * Middleware pro logovanie požiadaviek
 */

import express from "express";
import debug from "debug";

const debugLog = debug('http');

export default function () {
  /*
   * Pomocná funkcia pre logovanie obsahu req.body odosielaného klientovy
   */
  function logResponseBody(req: express.Request, res: express.Response) {
    const originalWrite = res.write;
    const originalEnd = res.end;

    let body = '';

    // tslint:disable-next-line:only-arrow-functions
    res.write = function (chunk) {
      body += chunk.toString('utf8');
      return originalWrite.apply(res, arguments as any);
    };

    // tslint:disable-next-line:only-arrow-functions
    res.end = function (chunk) {
      if (chunk) {
        body += chunk.toString('utf8');
      }
      debugLog('%d %s %s => %o', res.statusCode, req.method, req.originalUrl, body);
      originalEnd.apply(res, arguments as any);
    };
  }

  /*
   * Handler pre logovanie
   */
  const log: express.RequestHandler = (req, res, next) => {
    debugLog('%s %s qs:%o body:%o', req.method, req.path, req.query, req.body);
    logResponseBody(req, res); // zaves sa na metódy res.write a res.end aby sa dalo logovať výstup http servera

    next(); // pokračuj ďalším handlerom
  };

  return log;
}

