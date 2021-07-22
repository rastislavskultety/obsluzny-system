/*
 * Pomocné funkcie pre api routery
 */

import express from "express";
import ExtendedRequest from "../../middleware/extended-request";


/*
 * Spracovanie neplatnej relácie
 *
 * Pokiaľ zistí že relácia (session) je neplatná, tak odošle chybovú odozvu
 *
 * Návratová hodnota: true ak funkcia odoslala chybovú odozvu (relácia bola neplatná), ináč false
 */
export function handleInvalidSession(req: express.Request, res: express.Response): boolean {
  const session = (req as ExtendedRequest).session;
  if (session) {
    return false;
  } else {
    res.status(401).send({ error: "Invalid session" });
    return true;
  }
}



/*
 * Spracovanie neplatných parametrov
 *
 * Overuje platnosť integer/float parametrov, ak nie je platný, tak odošle chybocú odozvu.
 *
 * Návratová hodnota: true ak funkcia odoslala chybovú odozvu (parameter bola neplatný), ináč false
 */
export function handleInvalidParameter(req: express.Request, res: express.Response, param: string, type: string): boolean {

  const value = req.body[param];

  // Test či je parameter prítomný
  if (typeof value === "undefined") {
    res.status(400).send({ error: 'Missing required parameter ' + param });
    return true;
  }

  // Over či je integer alebo float
  switch (type) {
    case 'integer':
      if (typeof value !== 'number' || !Number.isInteger(value)) {
        res.status(400).send({ error: `Parameter ${param} has to be an integer` });
        return true;
      }
      break;
    case 'float':
      if (typeof value !== 'number' || isNaN(value)) {
        res.status(400).send({ error: `Parameter ${param} has to be a number` });
        return true;
      }
      break;
  }

  return false; // Parameter je platný
}
