import { and, desc, eq } from "drizzle-orm";
import { db } from "../db";
import {
  type ChatDTO,
  chatParticipantsTable,
  messageStatusTable,
  messageTable,
} from "../db/schema";

async function findManyByUserId(userId: string) {
  // Fetch all chats the user participates in, along with the last message
  // and all participants for each chat
  const rawChats = await db.query.chatParticipantsTable.findMany({
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
                  socketId: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // Fetch all unread message statuses for the user across all chats
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

  // Build a lookup map of unread message count per chat id
  const unreadCountByChatId: Record<string, number> = {};

  // Count unread messages per chat
  for (const status of userUnreadEvents) {
    const chatId = status.message.chat.id;
    unreadCountByChatId[chatId] = (unreadCountByChatId[chatId] ?? 0) + 1;
  }

  // Transform raw DB data into ChatDTO shape expected by the frontend
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
