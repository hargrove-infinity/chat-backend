type CreatedChat = {
  type: "GROUP" | "DIRECT";
  name: string | null;
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

type ChatWithParticipantsRaw = {
  type: "GROUP" | "DIRECT";
  name: string | null;
  chatParticipants: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }[];
};

export const getInterlocutorIds = ({
  chatWithParticipantsRaw,
  chatCreatorId,
}: {
  chatWithParticipantsRaw: ChatWithParticipantsRaw;
  chatCreatorId: string;
}): string[] => {
  if (chatWithParticipantsRaw.type === "GROUP") {
    return [];
  }

  const interlocutorIds = chatWithParticipantsRaw.chatParticipants
    .filter((participant) => {
      return participant.user.id !== chatCreatorId;
    })
    .map((participant) => participant.user.id);

  return interlocutorIds;
};

export const getChatName = ({
  chatWithParticipantsRaw,
  chatCreatorId,
  createdChat,
}: {
  chatWithParticipantsRaw: ChatWithParticipantsRaw;
  chatCreatorId: string;
  createdChat: CreatedChat;
}): string | null => {
  if (createdChat.type === "GROUP") {
    return createdChat.name;
  }

  const interlocutor = chatWithParticipantsRaw.chatParticipants.find(
    (participant) => participant.user.id !== chatCreatorId,
  );

  if (interlocutor) {
    return `${interlocutor.user.firstName} ${interlocutor.user.lastName}`;
  }

  return null;
};

export const getOnlineStatus = ({
  chatWithParticipantsRaw,
  chatCreatorId,
  createdChat,
  onlineUserSocketIdMap,
}: {
  chatWithParticipantsRaw: ChatWithParticipantsRaw;
  chatCreatorId: string;
  createdChat: CreatedChat;
  onlineUserSocketIdMap: Record<string, string>;
}): boolean => {
  if (createdChat.type === "DIRECT") {
    const interlocutor = chatWithParticipantsRaw.chatParticipants.find(
      (participant) => participant.user.id !== chatCreatorId,
    );

    if (interlocutor) {
      return !!onlineUserSocketIdMap[interlocutor.user.id];
    }

    return false;
  }

  return false;
};

export const hasDuplicates = (uuids: string[]): boolean => {
  const seen = new Set<string>();

  for (const uuid of uuids) {
    if (seen.has(uuid)) {
      return true;
    }
    seen.add(uuid);
  }

  return false;
};
