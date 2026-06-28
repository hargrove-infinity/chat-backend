import { logger } from "../../logger";
import { messageRepository } from "../../repositories/message.repository";
import { messageStatusRepository } from "../../repositories/messageStatus.repository";
import { presenceService } from "../../services/presence.service";
import type { ReadReceiptPayload } from "./chat.types";

/**
 * Updates read status in the database and prepares notifications for message authors.
 *
 * This function:
 * 1. Marks the specified messages as read for the given reader in messageStatusTable
 *    (only rows where read = false, scoped to the reader's userId).
 * 2. Queries messages joined with their authors, grouping by authorId
 * 3. Returns one entry per online author, each containing the aggregated messageIds
 *    they authored and the readerId — ready to emit read receipt events.
 */
export async function processMessageReadReceipt(
  payload: ReadReceiptPayload,
): Promise<
  | [
      Array<{
        authorSocketId: string;
        readerId: string;
        messageIds: string[];
      }>,
      null,
    ]
  | [null, Error]
> {
  // Sets read = true in messageStatusTable for all given messageIds
  // where userId = readerId and read = false (skips already-read rows)
  const [, updateMessagesAsReadError] =
    await messageStatusRepository.updateMessagesAsRead(payload);

  if (updateMessagesAsReadError) {
    logger.warn(
      {
        error: updateMessagesAsReadError.message,
        readerId: payload.readerId,
        messageIds: payload.messageIds,
      },
      "Failed to update messages as read while processing read receipt",
    );
    return [null, new Error("Unknown error")];
  }

  const [authorGroups, authorGroupsError] =
    await messageRepository.findAuthorUserMessageGroups(payload.messageIds);

  if (authorGroupsError) {
    logger.warn(
      {
        error: authorGroupsError.message,
        readerId: payload.readerId,
        messageIds: payload.messageIds,
      },
      "Failed to fetch author message groups while processing read receipt",
    );
    return [null, new Error("Unknown error")];
  }

  const userIds = authorGroups.map((group) => group.authorUserId);

  const [onlineUserSocketIdMap, onlineUserSocketIdMapError] =
    await presenceService.getUserSocketMap(userIds);

  if (onlineUserSocketIdMapError) {
    logger.warn(
      {
        error: onlineUserSocketIdMapError.message,
        readerId: payload.readerId,
        messageIds: payload.messageIds,
      },
      "Failed to fetch online user socket id map while processing read receipt",
    );
    return [null, new Error("Unknown error")];
  }

  const onlineAuthorGroups = authorGroups
    .map((group) => ({
      authorSocketId: onlineUserSocketIdMap[group.authorUserId],
      messageIds: group.messageIds,
    }))
    .filter(
      (group): group is { authorSocketId: string; messageIds: string[] } =>
        typeof group.authorSocketId === "string",
    );

  const authorNotifications = onlineAuthorGroups.map((group) => ({
    ...group,
    readerId: payload.readerId,
  }));

  return [authorNotifications, null];
}

type ErrorAck = { ok: false; error: string };

type HandleEventArgs<AckData> = {
  operation: () => void;
  acknowledge: (ack: ErrorAck & AckData) => void;
  ackData: AckData;
};

export function handleEvent<AckData>(args: HandleEventArgs<AckData>) {
  const { ackData, acknowledge, operation } = args;

  try {
    operation();
  } catch (error) {
    const ack = {
      ...ackData,
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    } as const;

    acknowledge(ack);
  }
}
