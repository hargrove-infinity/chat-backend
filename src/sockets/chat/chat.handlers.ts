import { Namespace, Socket } from "socket.io";
import { CHAT_EVENTS, CONNECTION_EVENTS, WELCOME_EVENTS } from "../../common";
import { db } from "../../_mock/db";
import { v4 as uuidv4 } from "uuid";

export function registerChatHandlers(namespace: Namespace, socket: Socket) {
  socket.emit(WELCOME_EVENTS.CHAT, "Hello from the Backend chat namespace");

  socket.on(CONNECTION_EVENTS.CHAT, (msg) => {
    console.log("Chat message:", msg);
  });

  const user = db.users.find((user) => user.socketId === socket.id);

  if (!user) {
    throw new Error("User is missing");
  }

  socket.on(CHAT_EVENTS.JOIN_ROOM, (roomName) => {
    socket.join(roomName);
    console.log(`Socket ${socket.id} has joined ${roomName} room`);
    namespace
      .in(roomName)
      .emit(
        CHAT_EVENTS.JOIN_ROOM_MESSAGE,
        `Socket ${socket.id} has joined ${roomName} room`,
      );
  });

  socket.on(CHAT_EVENTS.LEAVE_ROOM, (roomName) => {
    socket.leave(roomName);
    console.log(`Socket ${socket.id} has left ${roomName} room`);
  });

  socket.on(
    CHAT_EVENTS.MESSAGE,
    ({ content, chatId }: { content: string; chatId: string }) => {
      const foundChat = db.chats.find((chat) => chat.id === chatId);

      const message = {
        id: uuidv4(),
        chatId,
        senderId: user.id,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.messages.push(message);

      if (foundChat?.type === "direct") {
        const interlocutorId = foundChat.participants.find(
          (userId) => userId !== user.id,
        );

        if (interlocutorId) {
          const interlocutor = db.users.find(
            (user) => user.id === interlocutorId,
          );

          if (interlocutor && interlocutor.socketId) {
            if (user.socketId) {
              namespace.to(user.socketId).emit(CHAT_EVENTS.MESSAGE, message);

              namespace
                .to(interlocutor.socketId)
                .emit(CHAT_EVENTS.MESSAGE, message);
            }
          }
        }
      } else {
        // TODO: Add later handling group chat
      }
    },
  );

  socket.on("disconnecting", (reason) => {
    console.log("Reason of a disconnecting chat:", reason);
  });

  socket.on("disconnect", (reason) => {
    console.log("Reason of a disconnect chat:", reason);
    user.socketId = null;
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
