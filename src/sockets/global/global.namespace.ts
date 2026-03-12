import type { Server } from "socket.io";
import { db } from "../../_mock/db";
import { connectionErrorHandler } from "./handlers/connection-error.handler";

export function initGlobalHandlers(io: Server) {
  io.engine.on("connection_error", connectionErrorHandler(db));
}
