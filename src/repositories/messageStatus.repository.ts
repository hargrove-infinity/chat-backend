import { and, eq, inArray } from "drizzle-orm";
import { db } from "../db";
import { messageStatusTable } from "../db/schema";
import type { ReadReceiptPayload } from "../sockets/chat/chat.types";

async function updateMessagesAsRead(payload: ReadReceiptPayload) {
  const { messageIds, readerId } = payload;

  const data = await db
    .update(messageStatusTable)
    .set({ read: true })
    .where(
      and(
        inArray(messageStatusTable.messageId, messageIds),
        eq(messageStatusTable.userId, readerId),
      ),
    );

  return data;
}

export const messageStatusRepository = {
  updateMessagesAsRead,
} as const;
