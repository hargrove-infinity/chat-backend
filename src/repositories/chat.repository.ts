import { and, desc, eq } from "drizzle-orm";
import type { ChatDTO } from "../_mock/types";
import { db } from "../db";
import {
  chatParticipantsTable,
  messageStatusTable,
  messageTable,
} from "../db/schema";

async function findManyByUserId(userId: string) {
  const rawChats = await db.query.chatParticipantsTable.findMany({
    where: eq(chatParticipantsTable.userId, userId),
    columns: { userId: false, chatId: false },
    with: {
      user: { columns: { id: true } },
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
                columns: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  socketId: true,
                },
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

  const chatDtos: ChatDTO[] = rawChats.map((rawChat) => {
    const participants = rawChat.chat.chatParticipants.map((participant) => {
      return {
        id: participant.user.id,
        name: `${participant.user.firstName} ${participant.user.lastName}`,
        isTyping: false,
      };
    });

    const defaultChatData = {
      id: rawChat.chat.id,
      type: rawChat.chat.type,
      name: rawChat.chat.name,
      participants: participants,
      lastMessage: rawChat.chat.messages[0]?.content ?? null,
      isOnline: false,
      unreadMessages: unreadCountByChatId[rawChat.chat.id] ?? 0,
    };

    if (rawChat.chat.type === "DIRECT") {
      const interlocutor = rawChat.chat.chatParticipants.find(
        (participant) => participant.user.id !== rawChat.user.id,
      );

      if (!interlocutor) {
        throw new Error("Interlocutor was not found");
      }

      return {
        ...defaultChatData,
        name: `${interlocutor.user.firstName} ${interlocutor.user.lastName}`,
        isOnline: !!interlocutor.user.socketId,
      };
    }

    return defaultChatData;
  });

  return chatDtos;
}

export const chatRepository = {
  findManyByUserId,
} as const;
