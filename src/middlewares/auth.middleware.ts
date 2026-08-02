import type { NextFunction, Request, Response } from "express";
import { auth } from "../auth";
import { logger } from "../logger";

type TokenSource = "header" | "body";

/**
 * Middleware that validates the auth token from the specified source (header or body)
 * against Better Auth's session store, and attaches the authenticated user to req.user
 */
export function authMiddleware(source: TokenSource) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const rawToken =
      source === "header" ? req.headers.authorization : req.body?.token;

    if (!rawToken || typeof rawToken !== "string") {
      res.status(400).send({ errors: ["Auth token is missing"] });
      return;
    }

    const token = rawToken.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      res.status(400).send({ errors: ["Auth token is malformed"] });
      return;
    }

    let session: Awaited<ReturnType<typeof auth.api.getSession>>;

    try {
      session = await auth.api.getSession({
        headers: new Headers({ Authorization: `Bearer ${token}` }),
      });
    } catch (error) {
      logger.error({ error }, "Failed to validate session in authMiddleware");
      res.status(500).send({ errors: ["Unknown error"] });
      return;
    }

    if (!session) {
      res.status(401).send({ errors: ["Unauthorized"] });
      return;
    }

    if (!session.user.emailVerified) {
      res.status(403).send({ errors: ["Email not verified"] });
      return;
    }

    req.user = session.user;
    next();
  };
}
