import type { NextFunction, Request, Response } from "express";

/**
 * Extracts req.body.logs and assigns it directly to req.body,
 * so downstream validation receives a plain array logs instead of the full object.
 */
export function extractLogsBody(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  req.body = req.body.logs;

  next();
}
