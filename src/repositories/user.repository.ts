import { and, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { db } from "../db";
import { messageTable, userTable } from "../db/schema";

async function findFirstByEmail(email: string) {
  const user = await db.query.userTable.findFirst({
    where: eq(userTable.email, email),
  });

  return user;
}

async function findAuthorSocketMessageGroups(messageIds: string[]) {
  const data = await db
    .select({
      authorSocketId: userTable.socketId,
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

export const userRepository = {
  findFirstByEmail,
  findAuthorSocketMessageGroups,
} as const;
