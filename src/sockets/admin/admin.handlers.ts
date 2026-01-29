import { Socket } from "socket.io";
import { CONNECTION_EVENTS, WELCOME_EVENTS } from "../../common";

export function registerAdminHandlers(socket: Socket) {
  socket.emit(WELCOME_EVENTS.ADMIN, "Hello from the Backend admin namespace");

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
