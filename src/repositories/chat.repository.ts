import { and, desc, eq } from "drizzle-orm";
import type { ChatDTO } from "../_mock/types";
import { db } from "../db";
import {
  chatParticipantsTable,
  messageStatusTable,
  messageTable,
} from "../db/schema";

async function findManyByUserId(userId: string) {
  const chatParticipantsExtended =
    await db.query.chatParticipantsTable.findMany({
      where: eq(chatParticipantsTable.userId, userId),
      columns: { userId: false, chatId: false },
      with: {
        user: {
          columns: { id: true, socketId: true },
        },
        chat: {
          columns: { id: true, name: true, type: true },
          with: {
            messages: {
              where: eq(messageTable.chatId, chatParticipantsTable.chatId),
              orderBy: [desc(messageTable.createdAt)],
              columns: { content: true },
              limit: 1,
            },
            chatParticipants: {
              columns: { userId: false, chatId: false },
              with: {
                user: {
                  columns: { id: true, firstName: true, lastName: true },
                },
              },
            },
          },
        },
      },
    });

  const userUnreadEvents = await db.query.messageStatusTable.findMany({
    where: and(
      eq(messageStatusTable.userId, userId),
      eq(messageStatusTable.read, false),
    ),
    with: {
      message: {
        with: { chat: { columns: { id: true } } },
      },
    },
  });

  const unreadCountByChatId: Record<string, number> = {};

  for (const status of userUnreadEvents) {
    const chatId = status.message.chat.id;
    unreadCountByChatId[chatId] = (unreadCountByChatId[chatId] ?? 0) + 1;
  }

  const chatDtos: ChatDTO[] = chatParticipantsExtended.map(
    (chatParticipant) => {
      const interlocutor = chatParticipant.chat.chatParticipants.find(
        (participant) => participant.user.id !== chatParticipant.user.id,
      );

      if (!interlocutor) {
        throw new Error("Interlocutor was not found");
      }

      const chatDirectName = `${interlocutor.user.firstName} ${interlocutor.user.lastName}`;

      const chatName =
        chatParticipant.chat.type === "DIRECT"
          ? chatDirectName
          : chatParticipant.chat.name;

      const participants = chatParticipant.chat.chatParticipants.map(
        (participant) => {
          return {
            id: participant.user.id,
            name: `${participant.user.firstName} ${participant.user.lastName}`,
            isTyping: false,
          };
        },
      );

      return {
        id: chatParticipant.chat.id,
        type: chatParticipant.chat.type,
        name: chatName,
        participants: participants,
        lastMessage: chatParticipant.chat.messages[0]?.content ?? null,
        isOnline: !!chatParticipant.user.socketId,
        unreadMessages: unreadCountByChatId[chatParticipant.chat.id] ?? 0,
      };
    },
  );

  return chatDtos;
}

export const chatRepository = {
  findManyByUserId,
} as const;
