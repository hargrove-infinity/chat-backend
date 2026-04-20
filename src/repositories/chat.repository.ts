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
        columns: { id: true, content: true },
        with: { chat: { columns: { id: true } } },
      },
    },
  });

  const chatParticipantsExtendedWithUnreadCounterPromises =
    chatParticipantsExtended.map(async (chatData) => {
      const unreadMessagesByChat = userUnreadEvents.filter(
        (userUnreadEvent) => {
          return userUnreadEvent.message.chat.id === chatData.chat.id;
        },
      );

      return { chatData, unreadMessages: unreadMessagesByChat.length };
    });

  const chatParticipantsExtendedWithUnreadCounter = await Promise.all(
    chatParticipantsExtendedWithUnreadCounterPromises,
  );

  const chatDtos: ChatDTO[] = chatParticipantsExtendedWithUnreadCounter.map(
    (chat) => {
      const interlocutor = chat.chatData.participants.find(
        (participant) => participant.user.id !== chat.chatData.user.id,
      );

      if (!interlocutor) {
        throw new Error("Interlocutor was not found");
      }

      const chatDirectName = `${interlocutor.user.firstName} ${interlocutor.user.lastName}`;

      const chatName =
        chat.chatData.chat.type === "DIRECT"
          ? chatDirectName
          : chat.chatData.chat.name;

      const participants = chat.chatData.participants.map((participant) => {
        return {
          id: participant.user.id,
          name: `${participant.user.firstName} ${participant.user.lastName}`,
          isTyping: false,
        };
      });

      return {
        id: chat.chatData.chat.id,
        type: chat.chatData.chat.type,
        name: chatName,
        participants: participants,
        lastMessage: chat.chatData.chat.messages[0]?.content ?? null,
        isOnline: !!chat.chatData.user.socketId,
        unreadMessages: chat.unreadMessages,
      };
    },
  );

  return chatDtos;
}

export const chatRepository = {
  findManyByUserId,
} as const;
