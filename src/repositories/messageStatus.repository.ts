import { and, eq, inArray } from "drizzle-orm";
import { db } from "../db";
import { messageStatusTable } from "../db/schema";
import { logger } from "../logger";
import { asyncTryCatch } from "../util/asyncTryCatch";

async function findUnreadByUserId(userId: string) {
  logger.info(
    { userId },
    "Fetching unread message statuses from database for user",
  );

  const [rows, error] = await asyncTryCatch(
    db.query.messageStatusTable.findMany({
      where: and(
        eq(messageStatusTable.userId, userId),
        eq(messageStatusTable.read, false),
      ),
      with: {
        message: {
          with: { chat: { columns: { id: true } } },
        },
      },
    }),
  );

  if (error) {
    logger.error(
      { error, userId },
      "Database error while fetching unread message statuses for user",
    );

    return [null, error] as const;
  }

  logger.info(
    { userId },
    "Unread message statuses successfully fetched from database for user",
  );

  return [rows, null] as const;
}

async function updateMessagesAsRead({
  readerId,
  messageIds,
}: {
  readerId: string;
  messageIds: string[];
}) {
  logger.info("Starting updateMessagesAsRead");

  if (!messageIds.length) {
    logger.info("Skipping updateMessagesAsRead: no message IDs provided");

    return [null, new Error("Messages was not provided")];
  }

  logger.info("Updating unread messages as read in database");

  const [rows, error] = await asyncTryCatch(
    db
      .update(messageStatusTable)
      .set({ read: true })
      .where(
        and(
          inArray(messageStatusTable.messageId, messageIds),
          eq(messageStatusTable.userId, readerId),
          eq(messageStatusTable.read, false),
        ),
      ),
  );

  if (error) {
    logger.error(
      { error },
      "Database error while updating messages as read in database",
    );

    return [null, error] as const;
  }

  logger.info("Messages updated as read in database successfully");

  return [rows, null] as const;
}

export const messageStatusRepository = {
  findUnreadByUserId,
  updateMessagesAsRead,
} as const;
