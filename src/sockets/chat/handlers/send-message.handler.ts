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

    // Problem: When User A creates a new chat and sends a message,
    // User B receives nothing — their socket only joins rooms once, at
    // connection time, so it never joined this chat's room since the
    // chat didn't exist yet.
    // Solution:
    // Look up the chat's participants and find which of them are online,
    // so we can join their sockets (including the sender's) to the room
    // before broadcasting. This lazily subscribes sockets to rooms created
    // after they connected, so the recipient gets this first message
    // without a reconnect/refresh.
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
