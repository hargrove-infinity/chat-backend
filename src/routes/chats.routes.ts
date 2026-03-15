import { Router } from "express";
import { db } from "../_mock/db";
import {
  type ChatDTO,
  type MessageDTO,
  MessageStatusEnum,
  type ReadEvent,
} from "../_mock/types";
import { paths } from "../common/paths";
import { authMiddleware } from "../middlewares/auth.middleware";

export const chatsRoutes = Router();

/**
 * Returns all chats for the authenticated user,
 * including the last message and resolved chat name for direct chats
 */

// TODO: Remove later
/**
 * Steps to create unreadMessages field
 * 1) I need to filter readEvents array by userId, chatId, status: unread
 * 2) If user several times read and unread the same message there are might be
 *    multiple readEvents with same userId, chatId, messageId, and status: unread
 *    but on the FE I need only last read status message
 *    therefore I need to find the last readEvent item
 *    I need to remove duplicates in simple words
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

      // 1. Filter readEvents array by userId, chatId, status: unread
      const unreadEvents = db.readEvents.filter(
        (readEvent) =>
          readEvent.userId === user.id &&
          readEvent.chatId === chat.id &&
          readEvent.status === "unread",
      );

      // 2. Deduplicate unread events by messageId, keeping only the most recent one per message
      const filteredUnreadEvents = unreadEvents.reduce(
        (acc: ReadEvent[], currentEvent) => {
          const existingEventIndex = acc.findIndex(
            (dedupedEvent) => dedupedEvent.messageId === currentEvent.messageId,
          );

          // Empty accumulator OR first encounter of this messageId — add it to the accumulator
          if (acc.length === 0 || existingEventIndex === -1) {
            acc.push(currentEvent);
          }
          // Duplicate messageId found — replace the existing event only if the current one is newer
          else if (existingEventIndex > -1) {
            if (
              acc[existingEventIndex] &&
              currentEvent.timestamp > acc[existingEventIndex].timestamp
            ) {
              acc[existingEventIndex] = currentEvent;
            }
          }

          return acc;
        },
        [],
      );

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
          unreadMessages: filteredUnreadEvents.length,
        };
      }

      return {
        ...chat,
        lastMessage: lastMessage?.content ?? null,
        isOnline: false,
        participants: extendedParticipants,
        unreadMessages: filteredUnreadEvents.length,
      };
    });

  res.send({ payload: chats });
});

/**
 * Returns all messages for a specific chat,
 * including resolved sender name and message status
 */
chatsRoutes.get(paths.chats.messagesByChatId, authMiddleware, (req, res) => {
  const { params } = req;
  const { chatId } = params;

  const messages: MessageDTO[] = db.messages
    .filter((msg) => msg.chatId === chatId)
    .map((msg) => {
      const foundSender = db.users.find((user) => user.id === msg.senderId);

      return {
        ...msg,
        status: MessageStatusEnum.SENT,
        senderName: foundSender
          ? `${foundSender.firstName} ${foundSender.lastName}`
          : null,
      };
    });

  res.send({ payload: messages });
});
