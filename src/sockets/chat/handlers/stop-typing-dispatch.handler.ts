import { CHAT_EVENTS } from "../../../common/socket";
import type { ChatSocket } from "../chat.types";

type StopTypingDispatchHandlerArgs = {
  userId: string;
  socket: ChatSocket;
};

export const stopTypingDispatchHandler =
  (args: StopTypingDispatchHandlerArgs) => (chatId: string) => {
    const { socket, userId } = args;

    socket
      .to(chatId)
      .emit(CHAT_EVENTS.STOP_TYPING_BROADCAST, { chatId, userId });
  };
