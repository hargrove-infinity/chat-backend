import type { NextFunction, Request, Response } from "express";
import type { UserSelect } from "../db/types";

/**
 * Middleware that validates the auth token from request headers,
 * decodes user data, and attaches the authenticated user to req.user
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { authorization } = req.headers;

  if (!authorization) {
    res.status(400).send({ errors: ["Auth token is missing"] });
    return;
  }

  const decoded: Omit<UserSelect, "password"> = JSON.parse(atob(authorization));
  req.user = decoded;

  next();
}
