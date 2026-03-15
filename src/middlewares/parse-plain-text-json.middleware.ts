import type { NextFunction, Request, Response } from "express";

/**
 * Parses a text/plain request body as JSON.
 * Needed for sendBeacon requests on POST /metrics/logs which use text/plain to avoid CORS preflight,
 * allowing the request to complete before the browser tab is closed.
 */
export function parsePlainTextJson(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.headers["content-type"]?.includes("text/plain")) {
    next();
    return;
  }

  if (!req.body) {
    res.status(400).send({ errors: [{ message: "Request body is empty" }] });
    return;
  }

  try {
    req.body = JSON.parse(req.body);
    next();
  } catch {
    res.status(400).send({
      errors: [{ message: "Failed to parse JSON from text/plain body" }],
    });
  }
}
