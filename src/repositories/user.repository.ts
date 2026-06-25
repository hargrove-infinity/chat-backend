import { and, eq, inArray, ne } from "drizzle-orm";
import { db } from "../db";
import { chatParticipantsTable, userTable } from "../db/schema";
import { logger } from "../logger";
import { asyncTryCatch } from "../util/asyncTryCatch";
import type { UserFilterFields } from "./user.repository.types";
import { buildWhereClause } from "./user.repository.utils";

async function findFirstBy(where: UserFilterFields) {
  logger.info("Fetching first user from database");

  const [rows, error] = await asyncTryCatch(
    db.query.userTable.findFirst({ where: buildWhereClause(where) }),
  );

  if (error) {
    logger.error({ error }, "Database error while fetching first user");

    return [null, error] as const;
  }

  logger.info("First user successfully fetched from database for user");

  return [rows, null] as const;
}

async function findUserIdsDirectChats({
  directChatIds,
  userId,
}: {
  directChatIds: string[];
  userId: string;
}) {
  logger.info(
    { userId, directChatIds },
    "Fetching user ids of direct chats from database",
  );

  const [rows, error] = await asyncTryCatch(
    db
      .select({ userId: userTable.id })
      .from(chatParticipantsTable)
      .innerJoin(userTable, eq(userTable.id, chatParticipantsTable.userId))
      .where(
        and(
          inArray(chatParticipantsTable.chatId, directChatIds),
          ne(chatParticipantsTable.userId, userId),
        ),
      ),
  );

  if (error) {
    logger.error(
      { error, userId, directChatIds },
      "Database error while fetching user ids of direct chats",
    );

    return [null, error] as const;
  }

  logger.info(
    { userId },
    "User ids of direct chats successfully fetched from database",
  );

  return [rows, null] as const;
}

export const userRepository = {
  findFirstBy,
  findUserIdsDirectChats,
} as const;
