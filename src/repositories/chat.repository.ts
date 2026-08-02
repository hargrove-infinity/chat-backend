import { and, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "../db";
import { chatParticipantsTable, chatTable } from "../db/schema";
import { logger } from "../logger";
import { asyncTryCatch } from "../util/asyncTryCatch";
import type { InsertChatInput } from "../validation/chats";

async function findDirectChatBetweenTwoUsers(userIds: string[]) {
  logger.info("Fetching direct chat info from database for users");

  const [userId, otherUserId] = userIds;

  if (!userId || !otherUserId) {
    return [null, new Error("Expected exactly two user IDs")] as const;
  }

  const currentUserParticipant = alias(
    chatParticipantsTable,
    "currentUserParticipant",
  );

  const selectedUserParticipant = alias(
    chatParticipantsTable,
    "selectedUserParticipant",
  );

  const [rows, error] = await asyncTryCatch(
    db
      .select({ chatId: chatTable.id })
      .from(chatTable)
      .innerJoin(
        currentUserParticipant,
        and(
          eq(currentUserParticipant.chatId, chatTable.id),
          eq(currentUserParticipant.userId, userId),
        ),
      )
      .innerJoin(
        selectedUserParticipant,
        and(
          eq(selectedUserParticipant.chatId, chatTable.id),
          eq(selectedUserParticipant.userId, otherUserId),
        ),
      )
      .where(eq(chatTable.type, "DIRECT"))
      .limit(1),
  );

  if (error) {
    logger.error(
      { error, userId },
      "Database error while fetching direct chat info for users",
    );

    return [null, error] as const;
  }

  logger.info(
    { userId },
    "Direct chat info successfully fetched from database for users",
  );

  return [rows, null] as const;
}

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

async function createWithParticipants(body: InsertChatInput) {
  logger.info("Creating chat with participants in database");

  const [result, error] = await asyncTryCatch(
    db.transaction(async (tx) => {
      const [createdChat] = await tx.insert(chatTable).values(body).returning();

      if (!createdChat) {
        throw new Error("Failed to create chat");
      }

      const chatParticipantsInsert = body.participantIds.map(
        (participantId) => ({
          chatId: createdChat.id,
          userId: participantId,
        }),
      );

      await tx.insert(chatParticipantsTable).values(chatParticipantsInsert);

      const chatWithParticipantsRaw = await tx.query.chatTable.findFirst({
        where: eq(chatTable.id, createdChat.id),
        columns: { name: true, type: true },
        with: {
          chatParticipants: {
            columns: { userId: false, chatId: false },
            with: { user: { columns: { id: true, name: true } } },
          },
        },
      });

      return { createdChat, chatWithParticipantsRaw };
    }),
  );

  if (error) {
    logger.error("Database error while creating chat with participants");

    return [null, error] as const;
  }

  logger.info("Chat with participants successfully created in database");

  return [result, null] as const;
}

export const chatRepository = {
  findDirectChatBetweenTwoUsers,
  createWithParticipants,
  findDirectChatIds,
} as const;
