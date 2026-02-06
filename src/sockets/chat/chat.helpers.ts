import type { DB } from "../../_mock/types";

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
        (chat) => chat.participants.includes(userId) && chat.type === "direct",
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
