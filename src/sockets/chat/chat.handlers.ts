import { CHAT_EVENTS, CONNECTION_EVENTS } from "../../common/socket";
import { logger } from "../../logger";
import { chatParticipantsRepository } from "../../repositories/chatParticipants.repository";
import { userRepository } from "../../repositories/user.repository";
import { presenceService } from "../../services/presence.service";
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

  const userId = await presenceService.getUserId(socket.id);

  if (!userId) {
    throw new Error("User id is missing");
  }

  const chatIds = await chatParticipantsRepository.findManyByUserId(userId);

  if (chatIds.length) {
    socket.join(chatIds);
  }

  const interlocutorIds =
    await userRepository.findDirectInterlocutorIds(userId);

  const interlocutorSocketIds =
    await presenceService.getSocketIds(interlocutorIds);

  const onlineInterlocutorSocketIds = interlocutorSocketIds.filter(
    (id) => id !== null,
  );

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
