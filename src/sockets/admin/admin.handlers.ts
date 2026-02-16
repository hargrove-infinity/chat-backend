import { CONNECTION_EVENTS } from "../../common/socket";
import type { AdminSocket } from "./admin.types";

export function registerAdminHandlers(socket: AdminSocket) {
  socket.on(CONNECTION_EVENTS.ADMIN, (msg) => {
    console.log("Admin message:", msg);
  });

  socket.on("disconnecting", (reason) => {
    console.log("Admin disconnecting:", reason);
  });

  socket.on("disconnect", (reason) => {
    console.log("Admin disconnected:", reason);
  });

  // TODO: add disconnection later
  // Disconnect for socket
  // setTimeout(() => {
  //   // true closes the underlying connection
  //   socket.disconnect(true);
  // }, 2000);
}
