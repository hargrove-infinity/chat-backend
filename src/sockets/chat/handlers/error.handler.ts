import { v4 as uuidv4 } from "uuid";
import type { DB, User } from "../../../_mock/types";
import { CHAT_NAMESPACE } from "../../../common/socket";
import type { ChatSocket } from "../chat.types";

type ErrorHandlerArgs = { db: DB; user: User; socket: ChatSocket };

export const errorHandler = (args: ErrorHandlerArgs) => (error: Error) => {
  const { db, user, socket } = args;

  const errorLog = {
    id: uuidv4(),
    message: error.message,
    name: error.name,
    socketId: socket.id,
    userId: user.id,
    event: "socket_server_event",
    namespace: CHAT_NAMESPACE,
    source: "server",
    timestamp: new Date().toISOString(),
  };

  db.logs = [...db.logs, errorLog];
};
