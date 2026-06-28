import { eq, inArray, sql } from "drizzle-orm";
import { db } from "../db";
import {
  chatParticipantsTable,
  messageStatusTable,
  messageTable,
  userTable,
} from "../db/schema";
import type { MessageInsert } from "../db/types";
import { logger } from "../logger";
import { asyncTryCatch } from "../util/asyncTryCatch";

async function createWithStatuses(messageModel: MessageInsert) {
  logger.info(
    { chatId: messageModel.chatId, userId: messageModel.userId },
    "Creating message with statuses in database",
  );

  const [result, error] = await asyncTryCatch(
    db.transaction(async (tx) => {
      const [createdMessage] = await tx
        .insert(messageTable)
        .values(messageModel)
        .returning();

      if (!createdMessage) {
        throw new Error("Failed to create message");
      }

      const participants = await tx.query.chatParticipantsTable.findMany({
        where: eq(chatParticipantsTable.chatId, messageModel.chatId),
        with: { user: { columns: { firstName: true, lastName: true } } },
      });

      const messageStatusesInsert = participants.map(({ userId }) => ({
        userId,
        messageId: createdMessage.id,
        read: userId === createdMessage.userId,
      }));

      await tx.insert(messageStatusTable).values(messageStatusesInsert);

      if (!createdMessage.userId) {
        throw new Error("Message has no userId");
      }

      return { createdMessage, participants };
    }),
  );

  if (error) {
    logger.error(
      { error, chatId: messageModel.chatId, userId: messageModel.userId },
      "Database error while creating message with statuses",
    );

    return [null, error] as const;
  }

  logger.info(
    { chatId: messageModel.chatId, userId: messageModel.userId },
    "Message with statuses successfully created in database",
  );

  return [result, null] as const;
}

async function findManyByChatId({
  userId,
  chatId,
}: {
  userId: string;
  chatId: string;
}) {
  logger.info(
    { userId, chatId },
    "Fetching messages from database for user by chat id",
  );

  const [rows, error] = await asyncTryCatch(
    db.query.messageTable.findMany({
      where: eq(messageTable.chatId, chatId),
      with: {
        sender: { columns: { firstName: true, lastName: true } },
        messageStatuses: {
          columns: { userId: true, read: true },
          with: {
            user: { columns: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    }),
  );

  if (error) {
    logger.error(
      { error, userId, chatId },
      "Database error while fetching messages for user by chat id",
    );

    return [null, error] as const;
  }

  logger.info(
    { userId, chatId },
    "Messages successfully fetched from database for user by chat id",
  );

  return [rows, null] as const;
}

async function findAuthorUserMessageGroups(messageIds: string[]) {
  logger.info("Fetching author message groups from database");

  const [rows, error] = await asyncTryCatch(
    db
      .select({
        authorUserId: userTable.id,
        messageIds: sql<string[]>`array_agg(${messageTable.id})`,
      })
      .from(messageTable)
      .innerJoin(userTable, eq(userTable.id, messageTable.userId))
      .where(inArray(messageTable.id, messageIds))
      .groupBy(userTable.id),
  );

  if (error) {
    logger.error(
      { error },
      "Database error while author message groups from database",
    );

    return [null, error] as const;
  }

  logger.info("Author message groups successfully fetched from database");

  return [rows, null] as const;
}

export const messageRepository = {
  createWithStatuses,
  findManyByChatId,
  findAuthorUserMessageGroups,
} as const;
