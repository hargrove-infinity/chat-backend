import { v4 as uuidv4 } from "uuid";
import { db } from "../../../_mock/db";
import {
  type MessageDTO,
  MessageStatusEnum,
  type ReadEvent,
  type User,
} from "../../../_mock/types";
import { CHAT_EVENTS } from "../../../common/socket";
import type { ChatSocket, SendMessageCallback } from "../chat.types";

type SendMessageHandlerArgs = {
  user: User;
  chatId: string;
  content: string;
  tempId: string;
  socket: ChatSocket;
  acknowledge: SendMessageCallback;
};

export const sendMessageHandler = (args: SendMessageHandlerArgs) => () => {
  const { user, chatId, content, tempId, socket, acknowledge } = args;

  if (!user.socketId) {
    throw new Error("User socket id is not set");
  }

  const message: MessageDTO = {
    id: uuidv4(),
    chatId: chatId,
    senderId: user.id,
    senderName: `${user.firstName} ${user.lastName}`,
    content: content,
    status: MessageStatusEnum.SENT,
    read: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const prevCount = db.messages.length;

  const res = db.messages.push(message);

  if (res === prevCount) {
    throw new Error("Message is not stored in DB");
  }

  // TODO: implement transaction when real db will be add
  // db.transaction((db) => {
  //   db.messages.insert(message);
  //   db.readEvents.insert(readEvent);
  // });

  const foundChat = db.chats.find((chat) => chat.id === chatId);

  if (!foundChat) {
    throw new Error("Chat is not found");
  }

  const readEvents: ReadEvent[] = foundChat.participants.map(
    (participantId) => ({
      userId: participantId,
      messageId: message.id,
      read: participantId === user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
  );

  db.readEvents.push(...readEvents);

  acknowledge({ ok: true, tempId: tempId, message });

  socket.to(chatId).emit(CHAT_EVENTS.NEW_MESSAGE, message);
};
