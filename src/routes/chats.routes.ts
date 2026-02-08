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
        };
      }

      return {
        ...chat,
        lastMessage: lastMessage?.content ?? null,
        isOnline: false,
      };
    });

  res.send({ payload: chats });
});

/**
 * Returns all messages for a specific chat
 */
chatsRoutes.get(paths.chats.messagesByChatId, authMiddleware, (req, res) => {
  const { params, user } = req;
  const { chatId } = params;

  if (!user) {
    res.status(400).send({ errors: ["User is not attached"] });
    return;
  }

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
