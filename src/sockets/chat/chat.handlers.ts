import { Namespace, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { CHAT_EVENTS, CONNECTION_EVENTS, WELCOME_EVENTS } from "../../common";
import { db } from "../../_mock/db";
import { getDirectInterlocutorSocketIds } from "./chat.helpers";

export function registerChatHandlers(namespace: Namespace, socket: Socket) {
  socket.emit(WELCOME_EVENTS.CHAT, "Hello from the Backend chat namespace");

  const user = db.users.find((user) => user.socketId === socket.id);

  if (!user) {
    throw new Error("User is missing");
  }

  socket.on(CONNECTION_EVENTS.CHAT, () => {
    const interlocutorSocketIds = getDirectInterlocutorSocketIds({
      db,
      userId: user.id,
    });

    if (interlocutorSocketIds.length) {
      namespace
        .to(interlocutorSocketIds)
        .emit(CONNECTION_EVENTS.ONLINE, user.id);
    }
  });

  socket.on(CHAT_EVENTS.JOIN_ROOMS, (roomIds: string[]) => {
    socket.join(roomIds);
  });

  socket.on(
    CHAT_EVENTS.MESSAGE,
    ({ content, chatId }: { content: string; chatId: string }) => {
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.messages.push(message);

      namespace.in(chatId).emit(CHAT_EVENTS.MESSAGE, message);
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
      namespace
        .to(interlocutorSocketIds)
        .emit(CONNECTION_EVENTS.OFFLINE, user.id);
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
