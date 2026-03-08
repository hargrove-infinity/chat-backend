import { CHAT_EVENTS } from "../../../common/socket";
import type { ChatSocket } from "../chat.types";

type StartTypingDispatchHandlerArgs = {
  userId: string;
  socket: ChatSocket;
};

export const startTypingDispatchHandler =
  (args: StartTypingDispatchHandlerArgs) => (chatId: string) => {
    const { socket, userId } = args;

    socket
      .to(chatId)
      .emit(CHAT_EVENTS.START_TYPING_BROADCAST, { chatId, userId });
  };
