import { eq } from "drizzle-orm";
import { MessageStatusEnum } from "../_mock/types";
import { db } from "../db";
import { messageTable } from "../db/schema";

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
  findManyByChatId,
} as const;
