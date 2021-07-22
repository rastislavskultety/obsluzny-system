/*
 * Middleware pro logovanie požiadaviek
 */

import express from "express";

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
      return originalWrite.apply(res, arguments);
    };

    // tslint:disable-next-line:only-arrow-functions
    res.end = function (chunk) {
      if (chunk) {
        body += chunk.toString('utf8');
      }
      // tslint:disable-next-line:no-console
      console.log(res.statusCode, req.method, req.originalUrl, '=>', body);
      originalEnd.apply(res, arguments);
    };
  }

  /*
   * Handler pre logovanie
   */
  const log: express.RequestHandler = (req, res, next) => {
    // tslint:disable-next-line:no-console
    console.log(req.method, req.path, 'Q:', req.query, 'B:', req.body);

    logResponseBody(req, res); // zaves sa na metódy res.write a res.end aby sa dalo logovať výstup http servera

    next(); // pokračuj ďalším handlerom
  };

  return log;
}

