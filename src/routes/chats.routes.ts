import { Router } from "express";
import { db } from "../_mock/db";
import {
  type ChatDTO,
  type MessageDTO,
  MessageStatusEnum,
} from "../_mock/types";
import { paths } from "../common/paths";
import { authMiddleware } from "../middlewares/auth.middleware";

export const chatsRoutes = Router();

/**
 * Returns all chats for the authenticated user,
 * including the last message and resolved chat name for direct chats
 */
chatsRoutes.get(paths.chats.list, authMiddleware, (req, res) => {
  const { user } = req;

  if (!user) {
    res.status(400).send({ errors: ["User is not attached"] });
    return;
  }

  const chats: ChatDTO[] = db.chats
    .filter((chat) => chat.participants.includes(user.id))
    .map((chat) => {
      const lastMessage = db.messages
        .filter((msg) => msg.chatId === chat.id)
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0];

      const extendedParticipants = chat.participants.map((participantId) => {
        const foundUser = db.users.find((u) => u.id === participantId);

        if (!foundUser) {
          throw new Error("User is not found");
        }

        return {
          id: participantId,
          name: `${foundUser.firstName} ${foundUser.lastName}`,
          isTyping: false,
        };
      });

      // 1. Filter readEvents array by userId and status: unread
      const userUnreadEvents = db.readEvents.filter(
        (readEvent) => readEvent.userId === user.id && !readEvent.read,
      );

      // 2. Narrow down to unread events belonging to the current chat
      const chatUnreadEvents = userUnreadEvents.filter((unreadEvent) => {
        const unreadMessage = db.messages.find(
          (message) => message.id === unreadEvent.messageId,
        );

        if (!unreadMessage) {
          throw new Error("Unread message is not found");
        }

        return unreadMessage.chatId === chat.id;
      });

      if (chat.type === "direct" && !chat.name) {
        const interlocutor = db.users.find(
          (u) => u.id !== user.id && chat.participants.includes(u.id),
        );

        return {
          ...chat,
          name: interlocutor
            ? `${interlocutor.firstName} ${interlocutor.lastName}`
            : null,
          lastMessage: lastMessage?.content ?? null,
          isOnline: !!interlocutor?.socketId,
          participants: extendedParticipants,
          unreadMessages: chatUnreadEvents.length,
        };
      }

      return {
        ...chat,
        lastMessage: lastMessage?.content ?? null,
        isOnline: false,
        participants: extendedParticipants,
        unreadMessages: chatUnreadEvents.length,
      };
    });

  res.send({ payload: chats });
});

/**
 * Returns all messages for a specific chat,
 * including resolved sender name and message status
 */
chatsRoutes.get(paths.chats.messagesByChatId, authMiddleware, (req, res) => {
  const { user, params } = req;
  const { chatId } = params;

  if (!user) {
    res.status(400).send({ errors: ["User is not attached"] });
    return;
  }

  const messages: MessageDTO[] = db.messages
    .filter((msg) => msg.chatId === chatId)
    .map((msg) => {
      const foundSender = db.users.find((user) => user.id === msg.userId);

      if (!foundSender) {
        throw new Error("Sender is not found");
      }

      /**
       * Resolve read events based on message ownership:
       * - Own messages: return read events for all other participants (excludes sender)
       *   to display who has read the message
       * - Others' messages: return only the current user's read event
       *   to display whether the current user has read it
       */
      const messageReadReceipts = db.readEvents
        .filter((readEvent) => {
          const isAuthorMessage = msg.userId === user.id;

          return (
            readEvent.messageId === msg.id &&
            (isAuthorMessage
              ? readEvent.userId !== msg.userId
              : readEvent.userId === user.id)
          );
        })
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

      // True only if all chat participants (sender + recipients) have read this message
      // Used to resolve message status: READ if everyone read it, SENT otherwise
      const isReadMessage = db.readEvents
        .filter((readEvent) => readEvent.messageId === msg.id)
        .every((readEventByMessage) => readEventByMessage.read);

      return {
        ...msg,
        status: isReadMessage ? MessageStatusEnum.READ : MessageStatusEnum.SENT,
        reads: messageReadReceipts,
        senderName: `${foundSender.firstName} ${foundSender.lastName}`,
      };
    });

  res.send({ payload: messages });
});
