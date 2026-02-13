import type { Namespace, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { db } from "../../_mock/db";
import { MessageStatusEnum } from "../../_mock/types";
import { CHAT_EVENTS, CONNECTION_EVENTS } from "../../common/socket";
import { getDirectInterlocutorSocketIds } from "./chat.helpers";
import type { ChatMessagePayload, SendMessageCallback } from "./chat.types";

export function registerChatHandlers(namespace: Namespace, socket: Socket) {
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

  socket.on(
    CHAT_EVENTS.SEND_MESSAGE,
    (payload: ChatMessagePayload, callback: SendMessageCallback) => {
      const { chatId, content, tempId } = payload;
      console.log(`Socket ${socket.id} has sent message to ${chatId} room`);

      const foundSender = db.users.find((userDb) => userDb.id === user.id);

      const message = {
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
    },
  );

  socket.on(
    CHAT_EVENTS.START_TYPING_DISPATCH,
    ({ chatId }: { chatId: string }) => {
      console.log(`Start typing in ${chatId}`);

      socket
        .to(chatId)
        .emit(CHAT_EVENTS.START_TYPING_BROADCAST, { chatId, userId: user.id });
    },
  );

  socket.on(
    CHAT_EVENTS.STOP_TYPING_DISPATCH,
    ({ chatId }: { chatId: string }) => {
      console.log(`Stop typing in ${chatId}`);

      socket
        .to(chatId)
        .emit(CHAT_EVENTS.STOP_TYPING_BROADCAST, { chatId, userId: user.id });
    },
  );

  socket.on("disconnecting", (reason) => {
    console.log("Reason of a disconnecting chat:", reason);
  });

  socket.on("disconnect", (reason) => {
    console.log("Reason of a disconnect chat:", reason);
    user.socketId = null;

    const interlocutorSocketIds = getDirectInterlocutorSocketIds({
      db,
      userId: user.id,
    });

    if (interlocutorSocketIds.length) {
      socket.to(interlocutorSocketIds).emit(CONNECTION_EVENTS.OFFLINE, user.id);
    }
  });

  // TODO: add disconnection later
  // Disconnect for socket
  // setTimeout(() => {
  //   // true closes the underlying connection
  //   socket.disconnect(true);
  // }, 2000);

  // TODO: apply this later
  // if (namespace.sockets.size > 1) {
  //   namespace.disconnectSockets();
  // }
}
