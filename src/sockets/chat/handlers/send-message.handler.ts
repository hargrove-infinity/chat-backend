import { v4 as uuidv4 } from "uuid";
import { db } from "../../../_mock/db";
import {
  type MessageDTO,
  MessageStatusEnum,
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

  const foundSender = db.users.find((userDb) => userDb.id === user.id);

  if (!user.socketId) {
    throw new Error("User socket id is not set");
  }

  const message: MessageDTO = {
    id: uuidv4(),
    chatId: chatId,
    senderId: user.id,
    senderName: foundSender
      ? `${foundSender.firstName} ${foundSender.lastName}`
      : null,
    content: content,
    status: MessageStatusEnum.SENT,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const prevCount = db.messages.length;

  const res = db.messages.push(message);

  if (res === prevCount) {
    throw new Error("Message is not stored in DB");
  }

  acknowledge({ ok: true, tempId: tempId, message });

  socket.to(chatId).emit(CHAT_EVENTS.NEW_MESSAGE, message);
};
