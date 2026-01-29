import { Namespace } from "socket.io";
import { ADMIN_EVENTS } from "../common";

/**
 * Periodically emits metrics to all connected admin clients,
 * reporting the current number of connected chat users
 */
export function startAdminMetrics(
  adminNamespace: Namespace,
  chatNamespace: Namespace,
) {
  setInterval(() => {
    adminNamespace.emit(ADMIN_EVENTS.METRICS, {
      userCount: chatNamespace.sockets.size,
    });
  }, 3000);
}
