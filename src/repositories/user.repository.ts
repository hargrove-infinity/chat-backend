import { and, eq, inArray, isNotNull, ne, sql } from "drizzle-orm";
import { db } from "../db";
import {
  chatParticipantsTable,
  chatTable,
  messageTable,
  userTable,
} from "../db/schema";
import { UserWhere } from "./user.repository.types";

async function findFirst (where: UserWhere) {
  const user = await db.query.userTable.findFirst({
    where,
  });
  return user;
}

async function updateBy(args: {
  where: UserWhere;
  set: Partial<typeof userTable.$inferSelect>;
}) {
  const { set, where } = args;

  const [user] = await db
    .update(userTable)
    .set(set)
    .where(where)
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
  findAuthorSocketMessageGroups,
  findOnlineDirectInterlocutorsSocketIds,
} as const;
