import { v4 as uuidv4 } from "uuid";
import { db } from "../../_mock/db";
import { type MessageDTO, MessageStatusEnum } from "../../_mock/types";
import { CHAT_EVENTS, CONNECTION_EVENTS } from "../../common/socket";
import { getDirectInterlocutorSocketIds } from "./chat.helpers";
import type { ChatSocket } from "./chat.types";

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

  socket.on(CHAT_EVENTS.SEND_MESSAGE, (payload, callback) => {
    const { chatId, content, tempId } = payload;

    const foundSender = db.users.find((userDb) => userDb.id === user.id);

    const message: MessageDTO = {
      id: uuidv4(),
      chatId,
      senderId: user.id,
      senderName: foundSender
        ? `${foundSender.firstName} ${foundSender.lastName}`
        : null,
      content,
      status: MessageStatusEnum.SENT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.messages.push(message);

    if (!user.socketId) {
      callback({ ok: false, tempId, error: "User socket id is not set" });
      return;
    }

    callback({ ok: true, tempId, message });

    socket.to(chatId).emit(CHAT_EVENTS.NEW_MESSAGE, message);
  });

  socket.on(CHAT_EVENTS.START_TYPING_DISPATCH, ({ chatId }) => {
    socket
      .to(chatId)
      .emit(CHAT_EVENTS.START_TYPING_BROADCAST, { chatId, userId: user.id });
  });

  socket.on(CHAT_EVENTS.STOP_TYPING_DISPATCH, ({ chatId }) => {
    socket
      .to(chatId)
      .emit(CHAT_EVENTS.STOP_TYPING_BROADCAST, { chatId, userId: user.id });
  });

  socket.on("disconnect", () => {
    user.socketId = null;

    const interlocutorSocketIds = getDirectInterlocutorSocketIds({
      db,
      userId: user.id,
    });

    if (interlocutorSocketIds.length) {
      socket.to(interlocutorSocketIds).emit(CONNECTION_EVENTS.OFFLINE, user.id);
    }
  });
}
