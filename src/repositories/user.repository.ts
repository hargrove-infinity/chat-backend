import { and, eq, inArray, isNotNull, ne, sql } from "drizzle-orm";
import { db } from "../db";
import {
  chatParticipantsTable,
  chatTable,
  messageTable,
  userTable,
} from "../db/schema";
import type { UpdateByArgs, UserColumnValueMap } from "./user.repository.types";
import { isUserColumnEntry } from "./user.repository.utils";

async function findFirstBy(args: UserColumnValueMap) {
  const entry = Object.entries(args)[0];

  if (!entry || !isUserColumnEntry(entry)) {
    throw new Error(
      "userRepository.findFirstBy requires at least one search field",
    );
  }

  const [column, value] = entry;

  const user = await db.query.userTable.findFirst({
    where: eq(userTable[column], value),
  });

  return user;
}

async function updateBy(args: UpdateByArgs) {
  const { set, where } = args;

  const setEntry = Object.entries(set)[0];

  if (!setEntry || !isUserColumnEntry(setEntry)) {
    throw new Error(
      "userRepository.updateBy set entry requires at least one search field",
    );
  }

  const whereEntry = Object.entries(where)[0];

  if (!whereEntry || !isUserColumnEntry(whereEntry)) {
    throw new Error(
      "userRepository.updateBy where entry requires at least one search field",
    );
  }

  const [setColumn, setValue] = setEntry;
  const [whereColumn, whereValue] = whereEntry;

  const [user] = await db
    .update(userTable)
    .set({ [setColumn]: setValue })
    .where(eq(userTable[whereColumn], whereValue))
    .returning();

  return user;
}

async function findFirstByEmail(email: string) {
  const user = await db.query.userTable.findFirst({
    where: eq(userTable.email, email),
  });

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
  findFirstBy,
  updateBy,
  findFirstByEmail,
  findAuthorSocketMessageGroups,
  findOnlineDirectInterlocutorsSocketIds,
} as const;
