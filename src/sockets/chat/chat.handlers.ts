import { CHAT_EVENTS, CONNECTION_EVENTS } from "../../common/socket";
import { logger } from "../../logger";
import { chatParticipantsRepository } from "../../repositories/chatParticipants.repository";
import { presenceService } from "../../services/presence.service";
import { usersService } from "../../services/users.service";
import { handleEvent } from "./chat.helpers";
import type { ChatSocket, ReadReceiptPayload } from "./chat.types";
import { disconnectHandler } from "./handlers/disconnect.handler";
import { errorHandler } from "./handlers/error.handler";
import { messageWasReadHandler } from "./handlers/message-was-read.handler";
import { sendMessageHandler } from "./handlers/send-message.handler";
import { startTypingDispatchHandler } from "./handlers/start-typing-dispatch.handler";
import { stopTypingDispatchHandler } from "./handlers/stop-typing-dispatch.handler";

export async function registerChatHandlers(socket: ChatSocket) {
  /**
   * Emit immediately to initialize the offset on the client side.
   * Required for connection state recovery.
   * @see CONNECTION_EVENTS.CONNECTED
   */
  socket.emit(CONNECTION_EVENTS.CONNECTED);

  const [userId, userIdError] = await presenceService.getUserId(socket.id);

  if (userIdError) {
    logger.warn(
      { error: userIdError.message },
      "Failed to fetch user id from Redis in socket register chat handlers",
    );

    throw new Error("Unknown error");
  }

  if (!userId) {
    logger.warn("User id from Redis is null in socket register chat handlers");

    throw new Error("User id is missing");
  }

  const [chatParticipantsByUserId, chatParticipantsByUserIdError] =
    await chatParticipantsRepository.findManyByUserId(userId);

  if (chatParticipantsByUserIdError) {
    logger.warn(
      { error: chatParticipantsByUserIdError.message },
      "Failed to fetch chat participant ids in socket register chat handlers",
    );

    throw new Error("Unknown error");
  }

  const chatIds = chatParticipantsByUserId.map((item) => item.chatId);

  if (chatIds.length) {
    socket.join(chatIds);
  }

  const [interlocutorIds, errorInterlocutorIds] =
    await usersService.findDirectInterlocutorIds(userId);

  if (errorInterlocutorIds) {
    logger.warn(
      { error: errorInterlocutorIds.message, userId },
      "Failed to fetch direct interlocutor ids in socket register chat handlers",
    );

    throw new Error("Unknown error");
  }

  const [onlineInterlocutorSocketIds, onlineInterlocutorSocketIdsError] =
    await presenceService.getSocketIdList(interlocutorIds);

  if (onlineInterlocutorSocketIdsError) {
    logger.warn(
      { error: onlineInterlocutorSocketIdsError.message },
      "Failed to fetch online interlocutor socket ids from Redis in socket register chat handlers",
    );

    throw new Error("Unknown error");
  }

  if (onlineInterlocutorSocketIds.length) {
    socket
      .to(onlineInterlocutorSocketIds)
      .emit(CONNECTION_EVENTS.ONLINE, userId);
  }

  socket.on("error", async (error: Error) => {
    try {
      const handler = errorHandler({ userId, socket });
      await handler(error);
    } catch (error) {
      logger.error(error, "error handler failed");
    }
  });

  socket.on(CHAT_EVENTS.SEND_MESSAGE, (payload, acknowledge) => {
    const { chatId, content, tempId } = payload;

    handleEvent({
      ackData: { tempId },
      acknowledge,
      operation: sendMessageHandler({
        userId,
        chatId,
        content,
        tempId,
        socket,
        acknowledge,
      }),
    });
  });

  socket.on(
    CHAT_EVENTS.START_TYPING_DISPATCH,
    startTypingDispatchHandler({ userId, socket }),
  );

  socket.on(
    CHAT_EVENTS.STOP_TYPING_DISPATCH,
    stopTypingDispatchHandler({ userId, socket }),
  );

  socket.on(
    CHAT_EVENTS.MESSAGE_WAS_READ,
    async (payload: ReadReceiptPayload) => {
      try {
        const handler = messageWasReadHandler(socket);
        await handler(payload);
      } catch (error) {
        logger.error(error, "message was read handler failed");
      }
    },
  );

  socket.on("disconnect", async () => {
    try {
      const handler = disconnectHandler({ userId, socket });
      await handler();
    } catch (error) {
      logger.error(error, "disconnect handler failed");
    }
  });
}
