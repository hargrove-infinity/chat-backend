import { and, desc, eq } from "drizzle-orm";
import type { ChatDTO } from "../_mock/types";
import { db } from "../db";
import {
  chatParticipantsTable,
  messageStatusTable,
  messageTable,
} from "../db/schema";

async function findManyByUserId(userId: string) {
  const chatParticipants = await db.query.chatParticipantsTable.findMany({
    where: eq(chatParticipantsTable.userId, userId),
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
        },
      },
    },
  });

  const chatParticipantsExtendedPromises = chatParticipants.map(
    async (chatParticipant) => {
      const participants = await db.query.chatParticipantsTable.findMany({
        where: eq(chatParticipantsTable.chatId, chatParticipant.chatId),
        with: {
          user: { columns: { id: true, firstName: true, lastName: true } },
        },
      });

      return { ...chatParticipant, participants };
    },
  );

  const chatParticipantsExtended = await Promise.all(
    chatParticipantsExtendedPromises,
  );

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

  const chatDtos: ChatDTO[] = chatParticipantsExtended.map((chat) => {
    const interlocutor = chat.participants.find(
      (participant) => participant.user.id !== chat.user.id,
    );

    if (!interlocutor) {
      throw new Error("Interlocutor was not found");
    }

    const chatDirectName = `${interlocutor.user.firstName} ${interlocutor.user.lastName}`;

    const chatName =
      chat.chat.type === "DIRECT" ? chatDirectName : chat.chat.name;

    const participants = chat.participants.map((participant) => {
      return {
        id: participant.user.id,
        name: `${participant.user.firstName} ${participant.user.lastName}`,
        isTyping: false,
      };
    });

    return {
      id: chat.chat.id,
      type: chat.chat.type,
      name: chatName,
      participants: participants,
      lastMessage: chat.chat.messages[0]?.content ?? null,
      isOnline: !!chat.user.socketId,
      unreadMessages: unreadCountByChatId[chat.chat.id] ?? 0,
    };
  });

  return chatDtos;
}

export const chatRepository = {
  findManyByUserId,
} as const;
