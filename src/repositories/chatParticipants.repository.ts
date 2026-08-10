import { desc, eq } from "drizzle-orm";
import { db } from "../db";
import { chatParticipantsTable, messageTable } from "../db/schema";
import { logger } from "../logger";
import { asyncTryCatch } from "../util/asyncTryCatch";

async function findManyByUserId(userId: string) {
  logger.info(
    { userId },
    "Fetching chat participants by user id from database for user",
  );

  const [rows, error] = await asyncTryCatch(
    db.query.chatParticipantsTable.findMany({
      where: eq(chatParticipantsTable.userId, userId),
    }),
  );

  if (error) {
    logger.error(
      { error, userId },
      "Database error while fetching chat participants for user",
    );

    return [null, error] as const;
  }

  logger.info(
    { userId },
    "Chat participants successfully fetched from database for user",
  );

  return [rows, null] as const;
}

async function findChatSummariesByUserId(userId: string) {
  logger.info({ userId }, "Fetching chat summaries from database for user");

  const [rows, error] = await asyncTryCatch(
    db.query.chatParticipantsTable.findMany({
      where: eq(chatParticipantsTable.userId, userId),
      columns: { userId: false, chatId: false },
      with: {
        user: { columns: { id: true } },
        chat: {
          columns: { id: true, name: true, type: true },
          with: {
            messages: {
              orderBy: [desc(messageTable.createdAt)],
              columns: { content: true },
              limit: 1,
            },
            chatParticipants: {
              columns: { userId: false, chatId: false },
              with: { user: { columns: { id: true, name: true } } },
            },
          },
        },
      },
    }),
  );

  if (error) {
    logger.error(
      { error, userId },
      "Database error while fetching chat summaries for user",
    );

    return [null, error] as const;
  }

  logger.info(
    { userId },
    "Chat summaries successfully fetched from database for user",
  );

  return [rows, null] as const;
}

async function findUserIdsByChatId(chatId: string) {
  logger.info(
    { chatId },
    "Fetching chat participants by chat id from database",
  );

  const [rows, error] = await asyncTryCatch(
    db.query.chatParticipantsTable.findMany({
      where: eq(chatParticipantsTable.chatId, chatId),
    }),
  );

  if (error) {
    logger.error({ chatId }, "Database error while fetching chat participants");

    return [null, error] as const;
  }

  logger.info(
    { chatId },
    "Chat participants successfully fetched from database for user",
  );

  return [rows, null] as const;
}

export const chatParticipantsRepository = {
  findManyByUserId,
  findChatSummariesByUserId,
  findUserIdsByChatId,
} as const;
