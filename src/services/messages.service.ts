import {
  type MessageDTO,
  type MessageInsert,
  MessageStatusEnum,
} from "../db/types";
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

async function sendMessage(
  messageModel: MessageInsert,
): Promise<[MessageDTO, null] | [null, Error]> {
  const [rawMessage, rawMessageError] =
    await messageRepository.createWithStatuses(messageModel);

  if (rawMessageError) {
    logger.warn(
      {
        error: rawMessageError.message,
        chatId: messageModel.chatId,
        userId: messageModel.userId,
      },
      "Failed to create message with statuses in messages service",
    );

    return [null, new Error("Unknown error")];
  }

  const { createdMessage, participants } = rawMessage;

  const reads = participants
    .filter((participant) => {
      return participant.userId !== createdMessage.userId;
    })
    .map((participant) => {
      return {
        userId: participant.userId,
        userName: `${participant.user.firstName} ${participant.user.lastName}`,
        read: false,
      };
    });

  const participant = participants.find(
    (participant) => participant.userId === createdMessage.userId,
  );

  if (!participant) {
    return [null, new Error("Unknown error")];
  }

  const messageDto: MessageDTO = {
    id: createdMessage.id,
    chatId: createdMessage.chatId,
    userId: createdMessage.userId,
    content: createdMessage.content,
    createdAt: createdMessage.createdAt,
    updatedAt: createdMessage.updatedAt,
    senderName: `${participant.user.firstName} ${participant.user.lastName}`,
    status: MessageStatusEnum.SENT,
    reads,
  };

  return [messageDto, null];
}

export const messagesService = {
  findManyByChatId,
  sendMessage,
} as const;
