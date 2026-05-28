import { createServer } from "node:http";
import { Server } from "socket.io";

import { createApp } from "./app";
import { envVariables } from "./common/env.config";
import { checkDatabaseConnection } from "./db";
import { logger } from "./logger";
import { checkRedisConnection } from "./redis";
import { initSockets } from "./sockets";

async function bootstrap() {
  await Promise.all([checkRedisConnection(), checkDatabaseConnection()]);

  const app = createApp();

  const server = createServer(app);

  const io = new Server(server, {
    cors: {
      origin: envVariables.frontendUrl,
      methods: ["GET", "POST"],
    },
    pingInterval: 1000,
    pingTimeout: 1000,
  });

  initSockets(io);

  server.listen(envVariables.port, () => {
    logger.info("Server is running");
  });
}

async function main() {
  try {
    await bootstrap();
  } catch (error) {
    logger.error({ error }, "Server failed to start");
    process.exit(1);
  }
}

main();
