import { CHAT_NAMESPACE } from "../../../common/socket";
import { logRepository } from "../../../repositories/log.repository";
import type { ChatSocket } from "../chat.types";

type ErrorHandlerArgs = {
  userId: string;
  socket: ChatSocket;
};

export const errorHandler =
  (args: ErrorHandlerArgs) => async (error: Error) => {
    const { userId, socket } = args;

    const errorLog = {
      message: error.message,
      name: error.name,
      socketId: socket.id,
      userId,
      event: "socket_server_event",
      namespace: CHAT_NAMESPACE,
      source: "server",
    };

    await logRepository.create([errorLog]);
  };
