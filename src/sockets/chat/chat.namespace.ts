import type { Server } from "socket.io";

import { CHAT_NAMESPACE, ERROR_EVENTS } from "../../common/socket";
import { logger } from "../../logger";
import { registerChatHandlers } from "./chat.handlers";
import { chatMiddleware } from "./chat.middleware";
import type { ChatNamespace } from "./chat.types";

export function initChatNamespace(io: Server) {
  const namespace: ChatNamespace = io.of(CHAT_NAMESPACE);

  namespace.use(chatMiddleware);

  namespace.on("connection", async (socket) => {
    try {
      await registerChatHandlers(socket);
    } catch (error) {
      logger.warn({ error }, "Failed to init chat namespace");

      const errorMessage =
        error instanceof Error ? error.message : "Unknown socket error";

      socket.emit(ERROR_EVENTS.CHAT_NAMESPACE_ERROR, { message: errorMessage });
      socket.disconnect(true);
    }
  });

  return namespace;
}
