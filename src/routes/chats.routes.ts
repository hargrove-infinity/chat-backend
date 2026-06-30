import { Router } from "express";
import { paths } from "../common/paths";
import { logger } from "../logger";
import { authMiddleware } from "../middlewares/auth.middleware";
import { chatsService } from "../services/chats.service";
import { messagesService } from "../services/messages.service";

export const chatsRoutes = Router();

/**
 * Returns all chats for the authenticated user,
 * including the last message and resolved chat name for direct chats
 */
chatsRoutes.get(
  paths.chats.list,
  authMiddleware("header"),
  async (req, res) => {
    const { user } = req;

    if (!user) {
      logger.warn("User is not attached to request in GET /chats");
      res.status(400).send({ errors: ["User is not attached"] });
      return;
    }

    const [chats, error] = await chatsService.findManyByUserId(user.id);

    if (error) {
      logger.error(
        { error, userId: user.id },
        "Failed to fetch chats in GET /chats",
      );

      res.status(500).send({ errors: [error.message] });
      return;
    }

    res.send({ payload: chats });
  },
);

/**
 * Returns all messages for a specific chat,
 * including resolved sender name and message status
 */
chatsRoutes.get(
  paths.chats.messagesByChatId,
  authMiddleware("header"),
  async (req, res) => {
    const { user, params } = req;
    // TODO: add validation for chatId
    const { chatId } = params;

    if (!user) {
      res.status(400).send({ errors: ["User is not attached"] });
      return;
    }

    if (typeof chatId !== "string") {
      res.status(400).send({ errors: ["Chat id is not string"] });
      return;
    }

    const [messages, error] = await messagesService.findManyByChatId({
      chatId,
      userId: user.id,
    });

    if (error) {
      logger.error(
        { error, userId: user.id },
        "Failed to fetch messages by chat id in GET /chats/:chatId/messages",
      );

      res.status(500).send({ errors: [error.message] });
      return;
    }

    res.send({ payload: messages });
  },
);
