import { createServer } from "node:http";
import { Server } from "socket.io";

import { createApp } from "./app";
import { envVariables } from "./common";
import { initSockets } from "./sockets";

const app = createApp();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: envVariables.frontendUrl,
    methods: ["GET", "POST"],
  },
});

initSockets(io);

server.listen(envVariables.port, () => {
  console.log("Server is running");
});
