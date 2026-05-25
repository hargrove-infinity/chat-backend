import { chatRepository } from "../repositories/chat.repository";
import { presenceService } from "./presence.service";

async function findManyByUserId(userId: string) {
  const chats = await chatRepository.findManyByUserId(userId);

  const interlocutorIds = chats
    .filter((chat) => chat.type === "DIRECT")
    .map((chat) => {
      const interlocutor = chat.participants.find(
        (participant) => participant.id !== userId,
      );
      return interlocutor?.id;
    })
    .filter((id): id is string => id !== undefined);

  const socketIds = await presenceService.getSocketIds(interlocutorIds);

  const onlineUserIds = new Set(
    interlocutorIds.filter((_, index) => socketIds[index] !== null),
  );

  const chatsDtos = chats.map((chat) => {
    if (chat.type === "DIRECT") {
      const interlocutor = chat.participants.find(
        (participant) => participant.id !== userId,
      );

      if (!interlocutor) {
        throw new Error("Interlocutor was not found");
      }

      return {
        ...chat,
        isOnline: onlineUserIds.has(interlocutor.id),
      };
    }

    return chat;
  });

  return chatsDtos;
}

export const chatsService = {
  findManyByUserId,
} as const;
