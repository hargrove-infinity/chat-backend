import { Router, Request } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { paths } from "../common";
import { mockedChats, mockedMessages, mockedUsers } from "../_mock";

export const chatsRoutes = Router();

/**
 * Returns all chats for the authenticated user,
 * including the last message and resolved chat name for direct chats
 */
chatsRoutes.get(paths.chats.list, authMiddleware, (req: Request, res) => {
  const { user } = req;

  if (!user) {
    res.status(400).send({ errors: ["User is not attached"] });
    return;
  }

  const chats = mockedChats
    .filter((chat) => chat.participants.includes(user.id))
    .map((chat) => {
      const lastMessage = mockedMessages
        .filter((msg) => msg.chatId === chat.id)
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0];

      if (chat.type === "direct" && !chat.name) {
        const interlocutor = mockedUsers.find(
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
 * Returns all messages for a specific chat,
 * marking each message as owned by the current user when applicable
 */
chatsRoutes.get(
  paths.chats.messagesByChatId,
  authMiddleware,
  (req: Request, res) => {
    const { params, user } = req;
    const { chatId } = params;

    if (!user) {
      res.status(400).send({ errors: ["User is not attached"] });
      return;
    }

    const messages = mockedMessages
      .filter((msg) => msg.chatId === chatId)
      .map((msg) => ({ ...msg, isMine: msg.senderId === user.id }));

    res.send({ payload: messages });
  },
);
