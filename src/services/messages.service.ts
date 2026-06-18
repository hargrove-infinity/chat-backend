import { type MessageDTO, MessageStatusEnum } from "../db/types";
import { logger } from "../logger";
import { messageRepository } from "../repositories/message.repository";

async function findManyByChatId({
  userId,
  chatId,
}: {
  userId: string;
  chatId: string;
}): Promise<[MessageDTO[], null] | [null, Error]> {
  const [rawMessages, rawMessagesError] =
    await messageRepository.findManyByChatId({ userId, chatId });

  if (rawMessagesError) {
    logger.warn(
      { error: rawMessagesError.message, userId, chatId },
      "Failed to fetch messages in messages service",
    );

    return [null, new Error("Unknown error")];
  }

  const messageDtos = rawMessages.map((msg) => {
    const { messageStatuses, sender, ...restMessage } = msg;

    const isAuthorMessage = msg.userId === userId;

    const messageReadReceipts = messageStatuses
      .filter((messageStatus) => {
        return isAuthorMessage
          ? messageStatus.userId !== msg.userId
          : messageStatus.userId === userId;
      })
      .map((messageStatus) => {
        return {
          userId: messageStatus.userId,
          userName: `${messageStatus.user.firstName} ${messageStatus.user.lastName}`,
          read: messageStatus.read,
        };
      });

    const isReadMessage = !!(
      msg.messageStatuses.length &&
      msg.messageStatuses.every((messageStatus) => messageStatus.read)
    );

    return {
      ...restMessage,
      reads: messageReadReceipts,
      status: isReadMessage ? MessageStatusEnum.READ : MessageStatusEnum.SENT,
      senderName: sender
        ? `${sender.firstName} ${sender.lastName}`
        : "Deleted user",
    };
  });

  return [messageDtos, null];
}

export const messagesService = {
  findManyByChatId,
} as const;
