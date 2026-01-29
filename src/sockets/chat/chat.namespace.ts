import { Server } from "socket.io";
import { CHAT_NAMESPACE } from "../../common";
import { chatMiddleware } from "./chat.middleware";
import { registerChatHandlers } from "./chat.handlers";

export function initChatNamespace(io: Server) {
  const namespace = io.of(CHAT_NAMESPACE);

  namespace.use(chatMiddleware);

  namespace.on("connection", (socket) =>
    registerChatHandlers(namespace, socket),
  );

  return namespace;
}
