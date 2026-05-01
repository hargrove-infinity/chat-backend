import { eq } from "drizzle-orm";
import { db } from "../db";
import { chatParticipantsTable } from "../db/schema";

async function findManyByUserId(userId: string) {
  const chatParticipantsByUserId =
    await db.query.chatParticipantsTable.findMany({
      where: eq(chatParticipantsTable.userId, userId),
    });

  const chatIdsByUserId = chatParticipantsByUserId.map((item) => item.chatId);

  return chatIdsByUserId;
}

export const chatParticipantsRepository = {
  findManyByUserId,
} as const;
