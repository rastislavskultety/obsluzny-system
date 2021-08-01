/*
 * Tento modul deklaruje rozširenie triedy express.Request o custom polia ktoré tam pridáva náš middleware
 */

import express from "express";
import { SessionData } from "../services/session";

export default interface ExtendedRequest extends express.Request {
  session?: {
    sid: string;
    data: SessionData
  }
}
