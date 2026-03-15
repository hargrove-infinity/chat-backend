import type { Socket } from "socket.io";
import { logger } from "../../logger";

const log = logger.child({ context: "Admin namespace handlers" });

export function registerAdminHandlers(socket: Socket) {
  socket.on("disconnect", (reason) => {
    log.info({ socketId: socket.id, reason }, "Admin disconnected");
  });
}
