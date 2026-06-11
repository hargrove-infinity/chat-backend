import type { ChatDTO } from "../db/types";
import { chatParticipantsRepository } from "../repositories/chatParticipants.repository";
import { messageStatusRepository } from "../repositories/messageStatus.repository";
import { presenceService } from "./presence.service";

async function findManyByUserId(userId: string): Promise<ChatDTO[]> {
  const rawChats =
    await chatParticipantsRepository.findChatSummariesByUserId(userId);

  const unreadStatuses =
    await messageStatusRepository.findUnreadByUserId(userId);

  // Build a lookup map of unread message count per chat id
  const unreadCountByChatId: Record<string, number> = {};

  // Count unread messages per chat
  for (const status of unreadStatuses) {
    const chatId = status.message.chat.id;
    unreadCountByChatId[chatId] = (unreadCountByChatId[chatId] ?? 0) + 1;
  }

  // Collect interlocutor IDs for presence check
  const interlocutorIds = rawChats
    .filter((rawChat) => rawChat.chat.type === "DIRECT")
    .map((rawChat) => {
      const interlocutor = rawChat.chat.chatParticipants.find(
        (p) => p.user.id !== rawChat.user.id,
      );
      return interlocutor?.user.id;
    })
    .filter((id): id is string => id !== undefined);

  const onlineUserSocketIdMap =
    await presenceService.getUserSocketMap(interlocutorIds);

  return rawChats.map((rawChat) => {
    const participants = rawChat.chat.chatParticipants.map((p) => ({
      id: p.user.id,
      name: `${p.user.firstName} ${p.user.lastName}`,
      isTyping: false,
    }));

    const baseChat = {
      id: rawChat.chat.id,
      type: rawChat.chat.type,
      name: rawChat.chat.name,
      participants,
      lastMessage: rawChat.chat.messages[0]?.content ?? null,
      isOnline: false,
      unreadMessages: unreadCountByChatId[rawChat.chat.id] ?? 0,
    };

    if (rawChat.chat.type === "DIRECT") {
      const interlocutor = rawChat.chat.chatParticipants.find(
        (p) => p.user.id !== rawChat.user.id,
      );

      if (!interlocutor) {
        throw new Error("Interlocutor was not found");
      }

      return {
        ...baseChat,
        name: `${interlocutor.user.firstName} ${interlocutor.user.lastName}`,
        isOnline: !!onlineUserSocketIdMap[interlocutor.user.id],
      };
    }

    return baseChat;
  });
}

export const chatsService = {
  findManyByUserId,
} as const;
