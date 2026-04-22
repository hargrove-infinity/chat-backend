import { v4 as uuidv4 } from "uuid";
import { db } from "../../../_mock/db";
import {
  type Message,
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

  const messageModel: Message = {
    id: uuidv4(),
    chatId: chatId,
    userId: user.id,
    content: content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const messageDto: MessageDTO = {
    ...messageModel,
    senderName: `${user.firstName} ${user.lastName}`,
    status: MessageStatusEnum.SENT,
    reads: [],
  };

  const prevCount = db.messages.length;

  const res = db.messages.push(messageModel);

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
      messageId: messageDto.id,
      read: participantId === user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
  );

  db.readEvents.push(...readEvents);

  // TODO: make one function
  // chats.routes - getMessagesByChat contains similar code
  const messageReadReceipts = db.readEvents
    .filter(
      (readEvent) =>
        readEvent.messageId === messageDto.id &&
        readEvent.userId !== messageDto.userId,
    )
    .map((readEvent) => {
      const user = db.users.find((u) => u.id === readEvent.userId);

      if (!user) {
        throw new Error("User is not found");
      }

      return {
        userId: readEvent.userId,
        userName: `${user.firstName} ${user.lastName}`,
        read: readEvent.read,
      };
    });

  acknowledge({
    ok: true,
    tempId: tempId,
    message: { ...messageDto, reads: messageReadReceipts },
  });

  socket.to(chatId).emit(CHAT_EVENTS.NEW_MESSAGE, messageDto);
};
