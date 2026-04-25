import { and, eq, inArray, isNotNull, ne } from "drizzle-orm";
import { db } from "../db";
import { chatParticipantsTable, chatTable, userTable } from "../db/schema";

async function findFirstByEmail(email: string) {
  const user = await db.query.userTable.findFirst({
    where: eq(userTable.email, email),
  });

  return user;
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

  const directChatIds = rawDirectChatIds.map((item) => item.chatId);

  const rawUserDirectChatIds = await db.query.chatParticipantsTable.findMany({
    where: and(
      inArray(chatParticipantsTable.chatId, directChatIds),
      ne(chatParticipantsTable.userId, userId),
    ),
  });

  const userIds = rawUserDirectChatIds.map((item) => item.userId);

  const rawUserSocketIds = await db.query.userTable.findMany({
    where: and(inArray(userTable.id, userIds), isNotNull(userTable.socketId)),
    columns: { socketId: true },
  });

  const userSocketIds = rawUserSocketIds.flatMap((item) => {
    if (typeof item.socketId === "string" && item.socketId.length > 0) {
      return item.socketId;
    }
    return [];
  });

  return userSocketIds;
}

export const userRepository = {
  findFirstByEmail,
  findOnlineDirectInterlocutorsSocketIds,
} as const;
