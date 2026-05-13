import { logger } from "../../logger";
import { messageStatusRepository } from "../../repositories/messageStatus.repository";
import { userRepository } from "../../repositories/user.repository";
import type { ReadReceiptPayload } from "./chat.types";

/**
 * Updates read status in the database and prepares notifications for message authors.
 *
 * This function:
 * 1. Marks the specified messages as read for the given reader in messageStatusTable
 *    (only rows where read = false, scoped to the reader's userId).
 * 2. Queries messages joined with their authors, grouping by authorSocketId —
 *    only authors who are currently online (socketId IS NOT NULL) are included.
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

  // Joins messageTable → userTable, filters to the given messageIds,
  // excludes offline authors (socketId IS NULL), and groups by socketId
  // so each online author appears once with all their read messageIds aggregated
  // TODO: remove later; tmp changes
  const data = await userRepository.findAuthorSocketMessageGroups([]);

  // TODO: remove logger; tmp changes
  logger.info({ AuthorSocketMessageGroups: data });

  // TODO: return to the previous state later; tmp changes
  const authorNotifications = [...(data || [])].map((itm) => ({
    ...itm,
    readerId: payload.readerId,
  }));

  return authorNotifications;
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
