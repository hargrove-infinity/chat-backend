import { CONNECTION_EVENTS } from "../../common/socket";
import type { AdminSocket } from "./admin.types";

export function registerAdminHandlers(socket: AdminSocket) {
  socket.on(CONNECTION_EVENTS.ADMIN, (msg) => {
    // biome-ignore lint/suspicious/noConsole: needed for debugging
    console.log("Admin namespace connection:admin message:", msg);
  });

  socket.on("disconnecting", (reason) => {
    // biome-ignore lint/suspicious/noConsole: needed for debugging
    console.log("Admin namespace disconnecting:", reason);
  });

  socket.on("disconnect", (reason) => {
    // biome-ignore lint/suspicious/noConsole: needed for debugging
    console.log("Admin namespace disconnected:", reason);
  });
}
