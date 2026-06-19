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
  Array<{
    authorSocketId: string;
    readerId: string;
    messageIds: string[];
  }>
> {
  // Sets read = true in messageStatusTable for all given messageIds
  // where userId = readerId and read = false (skips already-read rows)
  await messageStatusRepository.updateMessagesAsRead(payload);

  const authorGroups = await messageRepository.findAuthorUserMessageGroups(
    payload.messageIds,
  );

  const userIds = authorGroups.map((group) => group.authorUserId);

  const onlineUserSocketIdMap = await presenceService.getUserSocketMap(userIds);

  const onlineAuthorGroups = authorGroups
    .map((group) => ({
      authorSocketId: onlineUserSocketIdMap[group.authorUserId],
      messageIds: group.messageIds,
    }))
    .filter(
      (group): group is { authorSocketId: string; messageIds: string[] } =>
        typeof group.authorSocketId === "string",
    );

  return onlineAuthorGroups.map((group) => ({
    ...group,
    readerId: payload.readerId,
  }));
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
