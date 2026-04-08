import { createServer } from "node:http";
import { sql } from "drizzle-orm";
import { Server } from "socket.io";

import { createApp } from "./app";
import { envVariables } from "./common/env.config";
import { db } from "./db";
import { logger } from "./logger";
import { initSockets } from "./sockets";

//?
// 11. Is SELECT 1 the right approach to verify a database connection,
// or is there a more idiomatic/reliable way to do it with Drizzle ORM?
async function checkConnection() {
  try {
    await db.execute(sql`SELECT 1`);
    logger.info("Database connection successful");
  } catch (error) {
    logger.error({ error }, "Database connection failed");
  }
}

//?
// 12. What is the correct order of operations
// when bootstrapping an Express + Socket.io server — specifically,
// should the DB connection be verified before creating the app and server,
// and should server.listen be blocked until the DB is confirmed healthy?
checkConnection();

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
