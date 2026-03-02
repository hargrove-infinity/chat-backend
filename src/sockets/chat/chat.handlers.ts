import { db } from "../../_mock/db";
import { CHAT_EVENTS, CONNECTION_EVENTS } from "../../common/socket";
import { getDirectInterlocutorSocketIds, handleEvent } from "./chat.helpers";
import type { ChatSocket } from "./chat.types";
import { disconnectHandler } from "./handlers/disconnectHandler";
import { sendMessageHandler } from "./handlers/sendMessageHandler";
import { startTypingDispatchHandler } from "./handlers/startTypingDispatchHandler";
import { stopTypingDispatchHandler } from "./handlers/stopTypingDispatchHandler";

export function registerChatHandlers(socket: ChatSocket) {
  /**
   * Emit immediately to initialize the offset on the client side.
   * Required for connection state recovery.
   * @see CONNECTION_EVENTS.CONNECTED
   */
  socket.emit(CONNECTION_EVENTS.CONNECTED);

  const user = db.users.find((user) => user.socketId === socket.id);

  if (!user) {
    throw new Error("User is missing");
  }

  const chatIds = db.chats
    .filter((chat) => chat.participants.includes(user.id))
    .map((chat) => chat.id);

  if (chatIds.length) {
    socket.join(chatIds);
  }

  const interlocutorSocketIds = getDirectInterlocutorSocketIds({
    db,
    userId: user.id,
  });

  if (interlocutorSocketIds.length) {
    socket.to(interlocutorSocketIds).emit(CONNECTION_EVENTS.ONLINE, user.id);
  }

  socket.on(CHAT_EVENTS.SEND_MESSAGE, (payload, acknowledge) => {
    const { chatId, content, tempId } = payload;

    handleEvent({
      ackData: { tempId },
      acknowledge,
      operation: sendMessageHandler({
        user,
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
    startTypingDispatchHandler({ userId: user.id, socket }),
  );

  socket.on(
    CHAT_EVENTS.STOP_TYPING_DISPATCH,
    stopTypingDispatchHandler({ userId: user.id, socket }),
  );

  socket.on("disconnect", disconnectHandler({ db, user, socket }));
}
