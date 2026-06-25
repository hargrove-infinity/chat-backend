import { CHAT_EVENTS } from "../../../common/socket";
import { messagesService } from "../../../services/messages.service";
import type { ChatSocket, SendMessageCallback } from "../chat.types";

type SendMessageHandlerArgs = {
  userId: string;
  chatId: string;
  content: string;
  tempId: string;
  socket: ChatSocket;
  acknowledge: SendMessageCallback;
};

export const sendMessageHandler =
  (args: SendMessageHandlerArgs) => async () => {
    const { userId, chatId, content, tempId, socket, acknowledge } = args;

    const messageModel = { chatId: chatId, content: content, userId };

    const [messageDto, messageDtoError] =
      await messagesService.sendMessage(messageModel);

    if (messageDtoError) {
      acknowledge({
        ok: false,
        tempId: tempId,
        error: messageDtoError.message,
      });
      return;
    }

    acknowledge({
      ok: true,
      tempId: tempId,
      message: { ...messageDto },
    });

    socket.to(chatId).emit(CHAT_EVENTS.NEW_MESSAGE, messageDto);
  };
