import express from "express";
import cors from "cors";

import { authRoutes } from "./routes/auth.routes";
import { chatsRoutes } from "./routes/chats.routes";

export function createApp() {
  // Initialize Express application
  const app = express();

  /**
   * Enable CORS for cross-origin requests,
   * and parse incoming JSON request bodies
   */
  app.use(cors());
  app.use(express.json());

  /**
   * Register application routes:
   * - authRoutes: handles authentication-related endpoints (login, register, etc.)
   * - chatsRoutes: handles chat-related endpoints (chats, messages, etc.)
   */
  app.use(authRoutes);
  app.use(chatsRoutes);

  return app;
}
