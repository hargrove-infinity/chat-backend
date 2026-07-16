import type { UserDTO } from "../db/types";
import { logger } from "../logger";
import { chatRepository } from "../repositories/chat.repository";
import { userRepository } from "../repositories/user.repository";

async function findDirectInterlocutorIds(
  userId: string,
): Promise<[string[], null] | [null, Error]> {
  const [rawChatIds, rawChatIdsError] =
    await chatRepository.findDirectChatIds(userId);

  if (rawChatIdsError) {
    logger.warn(
      { error: rawChatIdsError.message, userId },
      "Failed to fetch direct chat ids in users service",
    );

    return [null, new Error("Unknown error")];
  }

  if (rawChatIds.length === 0) {
    return [[], null];
  }

  const directChatIds = rawChatIds.map((item) => item.chatId);

  const [rawUserIds, rawUserIdsError] =
    await userRepository.findUserIdsDirectChats({
      userId,
      directChatIds,
    });

  if (rawUserIdsError) {
    logger.warn(
      { error: rawUserIdsError.message, userId },
      "Failed to fetch user ids of direct chats in users service",
    );

    return [null, new Error("Unknown error")];
  }

  const directInterlocutorIds = rawUserIds.map((item) => item.userId);

  return [directInterlocutorIds, null];
}

async function findByText({
  text,
  page,
  size,
}: {
  text: string;
  page: string;
  size: string;
}): Promise<[UserDTO, null] | [null, Error]> {
  const [rawUsers, rawUsersError] = await userRepository.findByText({
    text,
    limit: +size,
    offset: +page * +size,
  });

  if (rawUsersError) {
    logger.warn(
      { error: rawUsersError.message },
      "Failed to fetch users by text in users service",
    );

    return [null, new Error("Unknown error")];
  }

  const [content, totalElements] = rawUsers;

  const payload = {
    content,
    hasMore: totalElements > (+page + 1) * +size,
    pageNumber: +page,
  };

  return [payload, null];
}

export const usersService = {
  findDirectInterlocutorIds,
  findByText,
} as const;
