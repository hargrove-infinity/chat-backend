import { CHAT_EVENTS } from "../../../common/socket";
import { logger } from "../../../logger";
import { chatParticipantsRepository } from "../../../repositories/chatParticipants.repository";
import { messagesService } from "../../../services/messages.service";
import { presenceService } from "../../../services/presence.service";
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

    const [participants, participantsError] =
      await chatParticipantsRepository.findUserIdsByChatId(chatId);

    if (participantsError) {
      logger.warn(
        { error: participantsError.message },
        "Failed to fetch participantIds from database in socket sendMessageHandler handler",
      );

      throw new Error("Unknown error");
    }

    const participantIds = participants.map((p) => p.userId);

    const [socketIds, socketIdsError] =
      await presenceService.getSocketIdList(participantIds);

    if (socketIdsError) {
      logger.warn(
        { error: socketIdsError.message },
        "Failed to fetch socketIds in Redis in socket sendMessageHandler handler",
      );

      throw new Error("Unknown error");
    }

    if (socketIds) {
      socket.nsp.in(socketIds).socketsJoin(chatId);
    }

    socket.to(chatId).emit(CHAT_EVENTS.NEW_MESSAGE, messageDto);
  };
