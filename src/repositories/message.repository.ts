import { eq } from "drizzle-orm";
import { db } from "../db";
import {
  chatParticipantsTable,
  messageStatusTable,
  messageTable,
} from "../db/schema";
import { type MessageInsert, MessageStatusEnum } from "../db/types";
import { logger } from "../logger";
import { asyncTryCatch } from "../util/asyncTryCatch";

async function createWithStatuses(messageModel: MessageInsert) {
  const res = await db.transaction(async (tx) => {
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

    const reads = participants
      .filter((participant) => {
        return participant.userId !== createdMessage.userId;
      })
      .map((participant) => {
        return {
          userId: participant.userId,
          userName: `${participant.user.firstName} ${participant.user.lastName}`,
          read: false,
        };
      });

    const participant = participants.find(
      (participant) => participant.userId === createdMessage.userId,
    );

    if (!participant) {
      throw new Error("Participant is not found");
    }

    return {
      id: createdMessage.id,
      chatId: createdMessage.chatId,
      userId: createdMessage.userId,
      content: createdMessage.content,
      createdAt: createdMessage.createdAt,
      updatedAt: createdMessage.updatedAt,
      senderName: `${participant.user.firstName} ${participant.user.lastName}`,
      status: MessageStatusEnum.SENT,
      reads,
    };
  });

  return res;
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

export const messageRepository = {
  createWithStatuses,
  findManyByChatId,
} as const;
