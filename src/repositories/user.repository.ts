import { and, eq, inArray, isNotNull, ne, sql } from "drizzle-orm";
import { db } from "../db";
import {
  chatParticipantsTable,
  chatTable,
  messageTable,
  userTable,
} from "../db/schema";
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

// TODO: remove later
async function findAuthorSocketMessageGroups(messageIds: string[]) {
  const data = await db
    .select({
      authorSocketId: sql<string>`${userTable.socketId}`,
      messageIds: sql<string[]>`array_agg(${messageTable.id})`,
    })
    .from(messageTable)
    .innerJoin(userTable, eq(userTable.id, messageTable.userId))
    .where(
      and(inArray(messageTable.id, messageIds), isNotNull(userTable.socketId)),
    )
    .groupBy(userTable.socketId);

  return data;
}

// TODO: uncomment later
// async function findAuthorUserMessageGroups(messageIds: string[]) {
//   const data = await db
//     .select({
//       authorUserId: userTable.id,
//       messageIds: sql<string[]>`array_agg(${messageTable.id})`,
//     })
//     .from(messageTable)
//     .innerJoin(userTable, eq(userTable.id, messageTable.userId))
//     .where(inArray(messageTable.id, messageIds))
//     .groupBy(userTable.id);

//   return data;
// }

async function findOnlineDirectInterlocutorsSocketIds(userId: string) {
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

  const rawUserSocketIds = await db
    .select({ socketId: userTable.socketId })
    .from(chatParticipantsTable)
    .innerJoin(userTable, eq(userTable.id, chatParticipantsTable.userId))
    .where(
      and(
        inArray(chatParticipantsTable.chatId, directChatIds),
        ne(chatParticipantsTable.userId, userId),
        isNotNull(userTable.socketId),
      ),
    );

  const userSocketIds = rawUserSocketIds.flatMap((item) => {
    if (typeof item.socketId === "string" && item.socketId.length > 0) {
      return item.socketId;
    }
    return [];
  });

  return userSocketIds;
}

export const userRepository = {
  findFirstBy,
  updateBy,
  findAuthorSocketMessageGroups,
  // TODO: uncomment later
  // findAuthorUserMessageGroups,
  findOnlineDirectInterlocutorsSocketIds,
} as const;
