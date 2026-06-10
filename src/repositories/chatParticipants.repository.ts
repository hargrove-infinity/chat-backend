import { desc, eq } from "drizzle-orm";
import { db } from "../db";
import { chatParticipantsTable, messageTable } from "../db/schema";

async function findManyByUserId(userId: string) {
  const chatParticipantsByUserId =
    await db.query.chatParticipantsTable.findMany({
      where: eq(chatParticipantsTable.userId, userId),
    });

  const chatIdsByUserId = chatParticipantsByUserId.map((item) => item.chatId);

  return chatIdsByUserId;
}

async function findChatSummariesByUserId(userId: string) {
  return await db.query.chatParticipantsTable.findMany({
    where: eq(chatParticipantsTable.userId, userId),
    columns: { userId: false, chatId: false },
    with: {
      user: { columns: { id: true } },
      chat: {
        columns: { id: true, name: true, type: true },
        with: {
          messages: {
            orderBy: [desc(messageTable.createdAt)],
            columns: { content: true },
            limit: 1,
          },
          chatParticipants: {
            columns: { userId: false, chatId: false },
            with: {
              user: {
                columns: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export const chatParticipantsRepository = {
  findManyByUserId,
  findChatSummariesByUserId,
} as const;
