import { and, eq, inArray, ne } from "drizzle-orm";
import { db } from "../db";
import { chatParticipantsTable, userTable } from "../db/schema";
import { logger } from "../logger";
import { asyncTryCatch } from "../util/asyncTryCatch";
import type {
  UserFilterFields,
  UserUpdateByArgs,
} from "./user.repository.types";
import { buildWhereClause } from "./user.repository.utils";

async function findFirstBy(where: UserFilterFields) {
  return db.query.userTable.findFirst({ where: buildWhereClause(where) });
}

async function updateBy(args: UserUpdateByArgs) {
  const [user] = await db
    .update(userTable)
    .set(args.set)
    .where(buildWhereClause(args.where))
    .returning();

  return user;
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
  updateBy,
  findUserIdsDirectChats,
} as const;
