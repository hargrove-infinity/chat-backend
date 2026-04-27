import { and, eq, ne } from "drizzle-orm";
import { MessageStatusEnum } from "../_mock/types";
import { db } from "../db";
import {
  chatParticipantsTable,
  messageStatusTable,
  messageTable,
  type NewMessage,
  userTable,
} from "../db/schema";

async function createWithStatuses(messageModel: NewMessage) {
  const res = await db.transaction(async (tx) => {
    const [createdMessage] = await tx
      .insert(messageTable)
      .values(messageModel)
      .returning();

    if (!createdMessage) {
      throw new Error("Failed to create message");
    }

    const foundChatParticipants = await tx.query.chatParticipantsTable.findMany(
      {
        where: eq(chatParticipantsTable.chatId, messageModel.chatId),
      },
    );

    const messageStatusesInsert = foundChatParticipants.map(({ userId }) => ({
      userId,
      messageId: createdMessage.id,
      read: userId === createdMessage.userId,
      createdAt: createdMessage.createdAt,
      updatedAt: createdMessage.updatedAt,
    }));

    await tx.insert(messageStatusTable).values(messageStatusesInsert);

    if (!createdMessage.userId) {
      throw new Error("Message has no userId");
    }

    const messageStatusesWithUserExceptAuthorMessage =
      await tx.query.messageStatusTable.findMany({
        where: and(
          eq(messageStatusTable.messageId, createdMessage.id),
          ne(messageStatusTable.userId, createdMessage.userId),
        ),
        columns: { userId: true, read: true },
        with: {
          user: { columns: { firstName: true, lastName: true } },
        },
      });

    const messageStatusesFormatted =
      messageStatusesWithUserExceptAuthorMessage.map((item) => ({
        userId: item.userId,
        userName: `${item.user.firstName} ${item.user.lastName}`,
        read: item.read,
      }));

    const user = await db.query.userTable.findFirst({
      where: eq(userTable, createdMessage.id),
      columns: { firstName: true, lastName: true },
    });

    if (!user) {
      throw new Error("User is not found");
    }

    return {
      id: createdMessage.id,
      chatId: createdMessage.chatId,
      userId: createdMessage.userId,
      content: createdMessage.content,
      createdAt: createdMessage.createdAt,
      updatedAt: createdMessage.updatedAt,
      senderName: `${user.firstName} ${user.lastName}`,
      status: MessageStatusEnum.SENT,
      reads: messageStatusesFormatted,
    };
  });

  return res;
}

async function findManyByChatId({
  userId,
  chatId,
}: {
  userId: string;
  chatId: string;
}) {
  const rawMessages = await db.query.messageTable.findMany({
    where: eq(messageTable.chatId, chatId),
    with: {
      sender: { columns: { firstName: true, lastName: true } },
      messageStatuses: {
        columns: { userId: true, read: true },
        with: {
          user: { columns: { id: true, firstName: true, lastName: true } },
        },
      },
    },
  });

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

  return messageDtos;
}

export const messageRepository = {
  createWithStatuses,
  findManyByChatId,
} as const;
