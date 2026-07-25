import { type Request, type Response, Router } from "express";
import { paths } from "../common/paths";
import { logger } from "../logger";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { chatsService } from "../services/chats.service";
import { messagesService } from "../services/messages.service";
import {
  type InsertChatInput,
  insertChatSchema,
  type QueryParamsChatIdInput,
  queryParamsChatIdSchema,
} from "../validation/chats";

export const chatsRouter = Router();

type ChatsLocals = {
  body: InsertChatInput;
};

/**
 * Creates a new chat.
 * The authenticated user is automatically added as a chat participant.
 */
chatsRouter.post(
  paths.chats.list,
  authMiddleware("header"),
  validate({ schema: insertChatSchema }),
  async (req: Request, res: Response<unknown, ChatsLocals>) => {
    const { user } = req;
    const { body } = res.locals;

    if (!user) {
      logger.warn("User is not attached to request in POST /chats");
      res.status(400).send({ errors: ["User is not attached"] });
      return;
    }

    const [chat, error] = await chatsService.create({
      ...body,
      chatCreatorId: user.id,
    });

    if (error) {
      logger.error(
        { error, userId: user.id },
        "Failed to create chat in POST /chats",
      );

      res.status(500).send({ errors: [error.message] });
      return;
    }

    res.send({ payload: chat });
  },
);

/**
 * Returns all chats for the authenticated user,
 * including the last message and resolved chat name for direct chats
 */
chatsRouter.get(
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

type MessagesByChatIdLocals = {
  params: QueryParamsChatIdInput;
};

/**
 * Returns all messages for a specific chat,
 * including resolved sender name and message status
 */
chatsRouter.get(
  paths.chats.messagesByChatId,
  authMiddleware("header"),
  validate({ schema: queryParamsChatIdSchema, key: "params" }),
  async (req: Request, res: Response<unknown, MessagesByChatIdLocals>) => {
    const { user } = req;
    const { chatId } = res.locals.params;

    if (!user) {
      res.status(400).send({ errors: ["User is not attached"] });
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
