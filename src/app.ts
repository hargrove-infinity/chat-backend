import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import { auth } from "./auth";
import { envVariables } from "./common/env.config";
import { paths } from "./common/paths";
import { chatsRouter } from "./routes/chats.routes";
import { metricsRouter } from "./routes/metrics.routes";
import { usersRouter } from "./routes/users.routes";

export function createApp() {
  // Initialize Express application
  const app = express();

  /**
   * Enable CORS for cross-origin requests,
   * and parse incoming JSON request bodies
   */
  app.use(
    cors({
      origin: envVariables.frontendUrl,
      credentials: true,
    }),
  );

  // Mount Better Auth's own routes (sign-up, sign-in, session, etc.) before express.json(),
  // since its handler needs to parse the raw request body itself — an earlier express.json()
  // would consume the stream and leave Better Auth with an empty body
  app.all(paths.auth.all, toNodeHandler(auth));

  app.use(express.json());
  // Parse plain text request bodies (used by sendBeacon on POST /metrics/logs which sends text/plain)
  app.use(express.text({ type: "text/plain" }));

  /**
   * Register application routes:
   * - chatsRouter: handles chat-related endpoints (chats, messages, etc.)
   * - metricsRouter: handles metrics-related endpoints (logs, etc.)
   * - usersRouter: handles user-related endpoints (search, etc.)
   */
  app.use(chatsRouter);
  app.use(metricsRouter);
  app.use(usersRouter);

  return app;
}
