import type { Server } from "socket.io";
import { connectionErrorHandler } from "./handlers/connection-error.handler";

export function initGlobalHandlers(io: Server) {
  io.engine.on("connection_error", connectionErrorHandler());
}
