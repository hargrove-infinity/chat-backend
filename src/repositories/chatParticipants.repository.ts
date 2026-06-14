import { desc, eq } from "drizzle-orm";
import { db } from "../db";
import { chatParticipantsTable, messageTable } from "../db/schema";
import { logger } from "../logger";
import { asyncTryCatch } from "../util/asyncTryCatch";

async function findManyByUserId(userId: string) {
  const chatParticipantsByUserId =
    await db.query.chatParticipantsTable.findMany({
      where: eq(chatParticipantsTable.userId, userId),
    });

  const chatIdsByUserId = chatParticipantsByUserId.map((item) => item.chatId);

  return chatIdsByUserId;
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
              with: {
                user: {
                  columns: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
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

export const chatParticipantsRepository = {
  findManyByUserId,
  findChatSummariesByUserId,
} as const;
