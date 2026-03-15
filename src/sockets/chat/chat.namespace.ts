import type { Server } from "socket.io";

import { CHAT_NAMESPACE } from "../../common/socket";
import { registerChatHandlers } from "./chat.handlers";
import { chatMiddleware } from "./chat.middleware";
import type { ChatNamespace } from "./chat.types";

export function initChatNamespace(io: Server) {
  const namespace: ChatNamespace = io.of(CHAT_NAMESPACE);

  namespace.use(chatMiddleware);

  namespace.on("connection", (socket) => registerChatHandlers(socket));

  return namespace;
}
