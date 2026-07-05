import type { NextFunction, Request, Response } from "express";
import type { UserSelect } from "../db/types";

type TokenSource = "header" | "body";

/**
 * Middleware that validates the auth token from the specified source (header or body),
 * decodes user data, and attaches the authenticated user to req.user
 */
export function authMiddleware(source: TokenSource) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token =
      source === "header" ? req.headers.authorization : req.body?.token;

    if (!token) {
      res.status(400).send({ errors: ["Auth token is missing"] });
      return;
    }

    const decoded: Omit<UserSelect, "password"> = JSON.parse(atob(token));

    req.user = decoded;

    next();
  };
}
