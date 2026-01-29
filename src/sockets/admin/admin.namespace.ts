import { Server } from "socket.io";
import { ADMIN_NAMESPACE } from "../../common";
import { adminMiddleware } from "./admin.middleware";
import { registerAdminHandlers } from "./admin.handlers";

export function initAdminNamespace(io: Server) {
  const namespace = io.of(ADMIN_NAMESPACE);

  namespace.use(adminMiddleware);

  namespace.on("connection", (socket) => {
    registerAdminHandlers(socket);
  });

  return namespace;
}
