import type { Server } from "socket.io";
import { startAdminMetrics } from "../metrics/admin.metrics";
import { initAdminNamespace } from "./admin/admin.namespace";
import { initChatNamespace } from "./chat/chat.namespace";
import { initGlobalHandlers } from "./global/global.namespace";

export function initSockets(io: Server) {
  initGlobalHandlers(io);
  const adminNamespace = initAdminNamespace(io);
  const chatNamespace = initChatNamespace(io);
  startAdminMetrics(adminNamespace, chatNamespace);
}
