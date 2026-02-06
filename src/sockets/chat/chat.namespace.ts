import type { Server } from "socket.io";

import { CHAT_NAMESPACE } from "../../common";
import { registerChatHandlers } from "./chat.handlers";
import { chatMiddleware } from "./chat.middleware";

export function initChatNamespace(io: Server) {
  const namespace = io.of(CHAT_NAMESPACE);

  namespace.use(chatMiddleware);

  namespace.on("connection", (socket) =>
    registerChatHandlers(namespace, socket),
  );

  return namespace;
}
