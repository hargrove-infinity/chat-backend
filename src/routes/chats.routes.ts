import { Router } from "express";
import { paths } from "../common/paths";
import type { ChatDTO, MessageDTO } from "../db/types";
import { authMiddleware } from "../middlewares/auth.middleware";
import { messageRepository } from "../repositories/message.repository";
import { chatsService } from "../services/chats.service";

export const chatsRoutes = Router();

/**
 * Returns all chats for the authenticated user,
 * including the last message and resolved chat name for direct chats
 */
chatsRoutes.get(paths.chats.list, authMiddleware, async (req, res) => {
  try {
    const { user } = req;

    if (!user) {
      res.status(400).send({ errors: ["User is not attached"] });
      return;
    }

    const chats: ChatDTO[] = await chatsService.findManyByUserId(user.id);

    res.send({ payload: chats });
  } catch (error) {
    // TODO: change later
    if (error instanceof Error) {
      res.status(500).send({ errors: [error.message] });
      return;
    }
    res.status(500).send({ errors: ["Unknown error"] });
  }
});

/**
 * Returns all messages for a specific chat,
 * including resolved sender name and message status
 */
chatsRoutes.get(
  paths.chats.messagesByChatId,
  authMiddleware,
  async (req, res) => {
    try {
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

      const messages: MessageDTO[] = await messageRepository.findManyByChatId({
        chatId,
        userId: user.id,
      });

      res.send({ payload: messages });
    } catch (error) {
      // TODO: change later
      if (error instanceof Error) {
        res.status(500).send({ errors: [error.message] });
        return;
      }
      res.status(500).send({ errors: ["Unknown error"] });
    }
  },
);
