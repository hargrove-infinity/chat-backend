import cors from "cors";
import express from "express";

import { authRoutes } from "./routes/auth.routes";
import { chatsRoutes } from "./routes/chats.routes";
import { metricsRouter } from "./routes/metrics.routes";

export function createApp() {
  // Initialize Express application
  const app = express();

  /**
   * Enable CORS for cross-origin requests,
   * and parse incoming JSON request bodies
   */
  app.use(cors());
  app.use(express.json());
  // Parse plain text request bodies (used by sendBeacon on POST /metrics/logs which sends text/plain)
  app.use(express.text({ type: "text/plain" }));

  /**
   * Register application routes:
   * - authRoutes: handles authentication-related endpoints (login, register, etc.)
   * - chatsRoutes: handles chat-related endpoints (chats, messages, etc.)
   * - metricsRouter: handles metrics-related endpoints (logs, etc.)
   */
  app.use(authRoutes);
  app.use(chatsRoutes);
  app.use(metricsRouter);

  return app;
}
