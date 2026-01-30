import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { paths } from "../common";
import { db } from "../_mock/db";

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

  const chats = db.chats
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
          name: `${interlocutor?.firstName} ${interlocutor?.lastName}`,
          lastMessage: lastMessage?.content,
        };
      }

      return { ...chat, lastMessage: lastMessage?.content };
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

  const messages = db.messages
    .filter((msg) => msg.chatId === chatId)
    .map((msg) => {
      const foundSender = db.users.find((user) => user.id === msg.senderId);

      return {
        ...msg,
        senderName: foundSender
          ? `${foundSender.firstName} ${foundSender.lastName}`
          : null,
      };
    });

  res.send({ payload: messages });
});
