import { createServer } from "node:http";
import { Server } from "socket.io";

import { createApp } from "./app";
import { envVariables } from "./common/envVariables";
import { initSockets } from "./sockets";

const app = createApp();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: envVariables.frontendUrl,
    methods: ["GET", "POST"],
  },
  // transports: ["websocket"],
  pingInterval: 5000,
  pingTimeout: 5000,
  connectionStateRecovery: {
    maxDisconnectionDuration: 120000,
    skipMiddlewares: false,
  },
});

io.on("connection", (socket) => {
  console.log('io.on("connection").id', socket.id);
  console.log('io.on("connection").recovered', socket.recovered);
});

initSockets(io);

server.listen(envVariables.port, () => {
  console.log("Server is running");
});
