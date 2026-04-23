import type { DB } from "../../_mock/types";
import type { ReadReceiptPayload } from "./chat.types";

/**
 * Returns socket IDs of users who:
 * - share a direct chat with the given user
 * - are currently connected
 * - are not the given user themselves
 *
 * Used to notify other users about online/offline presence.
 */
export function getDirectInterlocutorSocketIds(args: {
  db: DB;
  userId: string;
}): string[] {
  const { db, userId } = args;

  return (
    db.chats
      // Select only direct chats where the current user is a participant
      .filter(
        (chat) => chat.participants.includes(userId) && chat.type === "DIRECT",
      )
      // For each chat, extract interlocutors (all participants except current user)
      .flatMap((chat) =>
        chat.participants
          .filter((participantId) => participantId !== userId)

          // Resolve interlocutor user entities from storage
          .map((userId) => {
            const user = db.users.find((user) => user.id === userId);

            if (!user) {
              throw new Error("User not found");
            }

            return user;
          })
          // Keep only users that currently have an active socket connection
          .filter((user) => user.socketId)
          // Extract socket IDs for direct namespace emissions
          .map((user) => {
            // Defensive check to ensure socketId exists at runtime
            if (!user.socketId) {
              throw new Error("User is not connected");
            }

            return user.socketId;
          }),
      )
  );
}

/**
 * Updates read status in the database and prepares notifications for message authors.
 *
 * This function:
 * 1. Marks the specified messages as read for the given reader in the DB.
 * 2. Finds the authors of those messages.
 * 3. Groups messages by author (so we send one event per author even if multiple messages were read).
 * 4. Returns the data needed to emit read receipt notifications to the correct authors.
 */
export function processMessageReadReceipt(args: {
  db: DB;
  payload: ReadReceiptPayload;
}): Array<{
  authorSocketId: string;
  readerId: string;
  messageIds: string[];
}> {
  const { db, payload } = args;
  const { readerId, messageIds } = payload;

  // ─────────────────────────────────────────────────────────────
  // 1. Update read status in the database for the reader
  // ─────────────────────────────────────────────────────────────
  db.readEvents = db.readEvents.map((readEvent) => {
    if (
      messageIds.includes(readEvent.messageId) &&
      readEvent.userId === readerId
    ) {
      return {
        ...readEvent,
        read: true,
        updatedAt: new Date().toISOString(),
      };
    }
    return readEvent;
  });

  // ─────────────────────────────────────────────────────────────
  // 2. Find authors of the read messages and their socket IDs
  // ─────────────────────────────────────────────────────────────
  const authorMessages = messageIds
    .map((messageId) => {
      const message = db.messages.find((msg) => msg.id === messageId);
      if (!message) {
        throw new Error(`Message not found: ${messageId}`);
      }
      return { authorId: message.userId, messageId };
    })
    .filter(
      (item, index, self) =>
        // Optional: remove duplicate messages if any
        index === self.findIndex((t) => t.messageId === item.messageId),
    );

  const authorSocketMessages = authorMessages.map((authorMessage) => {
    const user = db.users.find((u) => u.id === authorMessage.authorId);
    if (!user) {
      throw new Error(`User not found for authorId: ${authorMessage.authorId}`);
    }

    return {
      authorSocketId: user.socketId,
      messageId: authorMessage.messageId,
    };
  });

  // Keep only authors who are currently online (have a socketId)
  // flatMap is used instead of filter because filter alone cannot
  // narrow the type of authorSocketId from string | null to string
  const onlineAuthorSocketMessages = authorSocketMessages.flatMap((item) => {
    if (
      typeof item.authorSocketId === "string" &&
      item.authorSocketId.length > 0
    ) {
      return [
        { authorSocketId: item.authorSocketId, messageId: item.messageId },
      ];
    }
    return [];
  });

  // ─────────────────────────────────────────────────────────────
  // 3. Group messages by author so we emit only one event per author
  // ─────────────────────────────────────────────────────────────
  const groupedByAuthor = onlineAuthorSocketMessages.reduce<
    Record<string, { authorSocketId: string; messageIds: string[] }>
  >((acc, item) => {
    const key = item.authorSocketId;

    if (!acc[key]) {
      acc[key] = { authorSocketId: key, messageIds: [] };
    }

    acc[key].messageIds.push(item.messageId);
    return acc;
  }, {});

  // Convert to array of notifications
  const authorNotifications = Object.values(groupedByAuthor).map((group) => ({
    authorSocketId: group.authorSocketId,
    readerId,
    messageIds: group.messageIds,
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
