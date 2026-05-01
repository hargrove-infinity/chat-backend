import { CHAT_EVENTS } from "../../../common/socket";
import { messageRepository } from "../../../repositories/message.repository";
import type { ChatSocket, SendMessageCallback } from "../chat.types";

type SendMessageHandlerArgs = {
  userId: string;
  userSocketId: string | null;
  chatId: string;
  content: string;
  tempId: string;
  socket: ChatSocket;
  acknowledge: SendMessageCallback;
};

export const sendMessageHandler =
  (args: SendMessageHandlerArgs) => async () => {
    const {
      userId,
      userSocketId,
      chatId,
      content,
      tempId,
      socket,
      acknowledge,
    } = args;

    if (!userSocketId) {
      throw new Error("User socket id is not set");
    }

    const messageModel = { chatId: chatId, content: content, userId };

    const messageDto = await messageRepository.createWithStatuses(messageModel);

    acknowledge({
      ok: true,
      tempId: tempId,
      message: { ...messageDto },
    });

    socket.to(chatId).emit(CHAT_EVENTS.NEW_MESSAGE, messageDto);
  };
