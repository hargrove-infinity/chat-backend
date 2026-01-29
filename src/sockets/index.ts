import { Server } from "socket.io";
import { initAdminNamespace } from "./admin/admin.namespace";
import { initChatNamespace } from "./chat/chat.namespace";
import { startAdminMetrics } from "../metrics/admin.metrics";

export function initSockets(io: Server) {
  const adminNamespace = initAdminNamespace(io);
  const chatNamespace = initChatNamespace(io);
  startAdminMetrics(adminNamespace, chatNamespace);
}
