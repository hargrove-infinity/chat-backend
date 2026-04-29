import { and, eq, inArray, isNotNull, ne, sql, type SQL } from "drizzle-orm";
import { db } from "../db";
import {
  chatParticipantsTable,
  chatTable,
  messageTable,
  userTable,
} from "../db/schema";
import type { UserFilter, UserKey, UserPatch } from "./user.repository.types";

function buildWhere(where: UserFilter): SQL | undefined {
  const conds: SQL[] = [];
  const keys = Object.keys(where) as UserKey[]
  for (const key of keys) {
    const value = where[key];
    if (value === undefined) continue;
    conds.push(eq(userTable[key], value as never));
  }
  return conds.length ? and(...conds) : undefined;
}

async function findFirst(where: UserFilter) {
  return db.query.userTable.findFirst({ where: buildWhere(where) });
}

async function updateBy(args: { where: UserFilter; set: UserPatch }) {
  const [user] = await db
    .update(userTable)
    .set(args.set)
    .where(buildWhere(args.where))
    .returning();

  return user;
}

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
  findFirst,
  updateBy,
  findAuthorSocketMessageGroups,
  findOnlineDirectInterlocutorsSocketIds,
} as const;
