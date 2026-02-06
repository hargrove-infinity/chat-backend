import type { Server } from "socket.io";
import { startAdminMetrics } from "../metrics/admin.metrics";
import { initAdminNamespace } from "./admin/admin.namespace";
import { initChatNamespace } from "./chat/chat.namespace";

export function initSockets(io: Server) {
  const adminNamespace = initAdminNamespace(io);
  const chatNamespace = initChatNamespace(io);
  startAdminMetrics(adminNamespace, chatNamespace);
}
