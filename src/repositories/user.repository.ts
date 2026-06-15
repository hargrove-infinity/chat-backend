import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { db } from "../db";
import {
  chatParticipantsTable,
  chatTable,
  messageTable,
  userTable,
} from "../db/schema";
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

async function findAuthorUserMessageGroups(messageIds: string[]) {
  const data = await db
    .select({
      authorUserId: userTable.id,
      messageIds: sql<string[]>`array_agg(${messageTable.id})`,
    })
    .from(messageTable)
    .innerJoin(userTable, eq(userTable.id, messageTable.userId))
    .where(inArray(messageTable.id, messageIds))
    .groupBy(userTable.id);

  return data;
}

async function findDirectInterlocutorIds(userId: string) {
  const rawDirectChatIds = await db
    .select({ chatId: chatTable.id })
    .from(chatParticipantsTable)
    .innerJoin(chatTable, eq(chatParticipantsTable.chatId, chatTable.id))
    .where(
      and(
        eq(chatParticipantsTable.userId, userId),
        eq(chatTable.type, "DIRECT"),
      ),
    );

  if (rawDirectChatIds.length === 0) {
    return [];
  }

  const directChatIds = rawDirectChatIds.map((item) => item.chatId);

  const rawInterlocutors = await db
    .select({ userId: userTable.id })
    .from(chatParticipantsTable)
    .innerJoin(userTable, eq(userTable.id, chatParticipantsTable.userId))
    .where(
      and(
        inArray(chatParticipantsTable.chatId, directChatIds),
        ne(chatParticipantsTable.userId, userId),
      ),
    );

  return rawInterlocutors.map((item) => item.userId);
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
  findAuthorUserMessageGroups,
  findDirectInterlocutorIds,
  findUserIdsDirectChats,
} as const;
