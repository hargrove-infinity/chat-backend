import { and, eq, inArray } from "drizzle-orm";
import { db } from "../db";
import { messageStatusTable } from "../db/schema";
import { logger } from "../logger";
import type { ReadReceiptPayload } from "../sockets/chat/chat.types";
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

async function updateMessagesAsRead(payload: ReadReceiptPayload) {
  const { messageIds, readerId } = payload;

  if (!messageIds.length) {
    return;
  }

  const data = await db
    .update(messageStatusTable)
    .set({ read: true })
    .where(
      and(
        inArray(messageStatusTable.messageId, messageIds),
        eq(messageStatusTable.userId, readerId),
        eq(messageStatusTable.read, false),
      ),
    );

  return data;
}

export const messageStatusRepository = {
  findUnreadByUserId,
  updateMessagesAsRead,
} as const;
