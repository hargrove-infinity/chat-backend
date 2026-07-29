import type { ChatDTO } from "../db/types";
import { logger } from "../logger";
import { chatRepository } from "../repositories/chat.repository";
import { chatParticipantsRepository } from "../repositories/chatParticipants.repository";
import { messageStatusRepository } from "../repositories/messageStatus.repository";
import type { InsertChatInput } from "../validation/chats";
import {
  getChatName,
  getInterlocutorIds,
  getOnlineStatus,
  hasDuplicates,
} from "./chats.service.utils";
import { presenceService } from "./presence.service";

async function findManyByUserId(
  userId: string,
): Promise<[ChatDTO[], null] | [null, Error]> {
  const [rawChats, rawChatsError] =
    await chatParticipantsRepository.findChatSummariesByUserId(userId);

  if (rawChatsError) {
    logger.warn(
      { error: rawChatsError.message, userId },
      "Failed to fetch chat summaries in chats service",
    );

    return [null, new Error("Unknown error")];
  }

  const [unreadStatuses, unreadStatusesError] =
    await messageStatusRepository.findUnreadByUserId(userId);

  if (unreadStatusesError) {
    logger.warn(
      { error: unreadStatusesError.message, userId },
      "Failed to fetch unread statuses in chats service",
    );

    return [null, new Error("Unknown error")];
  }

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

  const [onlineUserSocketIdMap, onlineUserSocketIdMapError] =
    await presenceService.getUserSocketMap(interlocutorIds);

  if (onlineUserSocketIdMapError) {
    logger.warn(
      {
        error: onlineUserSocketIdMapError.message,
      },
      "Failed to fetch online user socket id map in chatsService.findManyByUserId",
    );
    return [null, new Error("Unknown error")];
  }

  let chatDtos: ChatDTO[];

  try {
    chatDtos = rawChats.map((rawChat) => {
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
  } catch (error) {
    logger.error(
      { error, userId },
      "Failed to build chat DTOs in chats service",
    );
    return [null, new Error("Unknown error")];
  }

  return [chatDtos, null];
}

async function create(
  body: InsertChatInput & { chatCreatorId: string },
): Promise<[ChatDTO, null] | [null, Error]> {
  const allParticipantIds = [...body.participantIds, body.chatCreatorId];

  if (allParticipantIds.length < 2) {
    logger.warn("Chat must include at least two participants");
    return [null, new Error("Chat must include at least two participants")];
  }

  if (body.type === "DIRECT" && allParticipantIds.length > 2) {
    logger.warn("DIRECT chat must include two participants at maximum");
    return [
      null,
      new Error("DIRECT chat must include two participants at maximum"),
    ];
  }

  if (hasDuplicates(allParticipantIds)) {
    logger.warn("ParticipantIds have duplicates");
    return [null, new Error("ParticipantIds have duplicates")];
  }

  if (body.type === "GROUP" && !body.name) {
    logger.warn("Name is not passed for GROUP type chat");
    return [null, new Error("Name must be provided for GROUP type chat")];
  }

  if (body.type === "DIRECT") {
    const [existingDirectChatIdInfo, existingDirectChatIdInfoError] =
      await chatRepository.findDirectChatBetweenTwoUsers(allParticipantIds);

    if (existingDirectChatIdInfoError) {
      logger.warn(
        { error: existingDirectChatIdInfoError.message },
        "Failed to check DIRECT chat existence in chats service",
      );

      return [null, new Error("Unknown error")];
    }

    if (existingDirectChatIdInfo.length) {
      logger.warn("DIRECT chat between two users already existed");
      return [null, new Error("DIRECT chat between two users already existed")];
    }
  }

  const [rawChat, rawChatError] = await chatRepository.createWithParticipants({
    type: body.type,
    name: body.name,
    participantIds: allParticipantIds,
  });

  if (rawChatError) {
    logger.warn(
      { error: rawChatError.message },
      "Failed to create chat in chats service",
    );

    return [null, new Error("Unknown error")];
  }

  const { createdChat, chatWithParticipantsRaw } = rawChat;

  if (!chatWithParticipantsRaw) {
    logger.warn("chatWithParticipantsRaw not found");
    return [null, new Error("Unknown error")];
  }

  const interlocutorIds = getInterlocutorIds({
    chatCreatorId: body.chatCreatorId,
    chatWithParticipantsRaw,
  });

  const [onlineUserSocketIdMap, onlineUserSocketIdMapError] =
    await presenceService.getUserSocketMap(interlocutorIds);

  if (onlineUserSocketIdMapError) {
    logger.warn(
      {
        error: onlineUserSocketIdMapError.message,
      },
      "Failed to fetch online user socket id map in chatsService.findManyByUserId",
    );
    return [null, new Error("Unknown error")];
  }

  const participants = chatWithParticipantsRaw.chatParticipants.map((p) => ({
    id: p.user.id,
    name: `${p.user.firstName} ${p.user.lastName}`,
    isTyping: false,
  }));

  const chatDto: ChatDTO = {
    id: createdChat.id,
    name: getChatName({
      chatCreatorId: body.chatCreatorId,
      chatWithParticipantsRaw,
      createdChat,
    }),
    type: createdChat.type,
    lastMessage: null,
    isOnline: getOnlineStatus({
      chatWithParticipantsRaw,
      chatCreatorId: body.chatCreatorId,
      createdChat,
      onlineUserSocketIdMap,
    }),
    participants,
    unreadMessages: 0,
  };

  return [chatDto, null];
}

export const chatsService = {
  findManyByUserId,
  create,
} as const;
