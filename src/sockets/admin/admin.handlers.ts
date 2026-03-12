import type { Socket } from "socket.io";

export function registerAdminHandlers(socket: Socket) {
  socket.on("disconnect", (reason) => {
    // biome-ignore lint/suspicious/noConsole: needed for debugging
    console.log("Admin namespace disconnected:", reason);
  });
}
