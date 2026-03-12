import { createServer } from "node:http";
import { Server } from "socket.io";

import { createApp } from "./app";
import { envVariables } from "./common/env.config";
import { logger } from "./logger";
import { initSockets } from "./sockets";

const app = createApp();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: envVariables.frontendUrl,
    methods: ["GET", "POST"],
  },
  pingInterval: 5000,
  pingTimeout: 5000,
  connectionStateRecovery: {
    maxDisconnectionDuration: 120000,
    skipMiddlewares: false,
  },
});

initSockets(io);

server.listen(envVariables.port, () => {
  logger.info("Server is running");
});
