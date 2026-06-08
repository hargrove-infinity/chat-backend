import { and, eq, inArray } from "drizzle-orm";
import { db } from "../db";
import { messageStatusTable } from "../db/schema";
import type { ReadReceiptPayload } from "../sockets/chat/chat.types";

async function findUnreadByUserId(userId: string) {
  return await db.query.messageStatusTable.findMany({
    where: and(
      eq(messageStatusTable.userId, userId),
      eq(messageStatusTable.read, false),
    ),
    with: {
      message: {
        with: { chat: { columns: { id: true } } },
      },
    },
  });
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
