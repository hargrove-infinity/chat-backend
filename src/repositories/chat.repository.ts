import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { chatParticipantsTable, chatTable } from "../db/schema";
import { logger } from "../logger";
import { asyncTryCatch } from "../util/asyncTryCatch";

async function findDirectChatIds(userId: string) {
  logger.info({ userId }, "Fetching direct chat ids from database for user");

  const [rows, error] = await asyncTryCatch(
    db
      .select({ chatId: chatTable.id })
      .from(chatParticipantsTable)
      .innerJoin(chatTable, eq(chatParticipantsTable.chatId, chatTable.id))
      .where(
        and(
          eq(chatParticipantsTable.userId, userId),
          eq(chatTable.type, "DIRECT"),
        ),
      ),
  );

  if (error) {
    logger.error(
      { error, userId },
      "Database error while fetching direct chat ids for user",
    );

    return [null, error] as const;
  }

  logger.info(
    { userId },
    "Direct chat ids successfully fetched from database for user",
  );

  return [rows, null] as const;
}

export const chatRepository = {
  findDirectChatIds,
} as const;
