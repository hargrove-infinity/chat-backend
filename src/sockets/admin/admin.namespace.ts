import type { Server } from "socket.io";
import { ADMIN_NAMESPACE } from "../../common/socket";
import { registerAdminHandlers } from "./admin.handlers";
import { adminMiddleware } from "./admin.middleware";
import type { AdminNamespace } from "./admin.types";

export function initAdminNamespace(io: Server) {
  const namespace: AdminNamespace = io.of(ADMIN_NAMESPACE);

  namespace.use(adminMiddleware);

  namespace.on("connection", (socket) => registerAdminHandlers(socket));

  return namespace;
}
