import type { chatTable, logTable, messageTable, userTable } from "./schema";

// ===== User =====

export type UserSelect = typeof userTable.$inferSelect;

export type UserInsert = typeof userTable.$inferInsert;

type UserAbbreviated = Pick<
  UserSelect,
  "id" | "firstName" | "lastName" | "email"
>;

export type UserDTO = {
  content: UserAbbreviated[];
} & Pagination;

// ===== Chat =====

export type ChatSelect = typeof chatTable.$inferSelect;

type Participant = { id: string; name: string; isTyping: boolean };

export type ChatDTO = Omit<
  ChatSelect,
  "participants" | "createdAt" | "updatedAt"
> & {
  /**
   * Resolved name for display
   * Group chats: stored name from Chat
   * Direct chats: participant's full name (resolved on BE)
   * Can be null if participant not found
   */
  name: string | null;

  /**
   * Content of the last message in the chat
   * Null if no messages exist
   */
  lastMessage: string | null;

  /**
   * Online status of the other participant
   * Only relevant for direct chats
   * Always false for group chats
   */
  isOnline: boolean;

  /**
   * Enhanced participant information with enriched details
   * Each participant includes:
   * - id: User's unique identifier
   * - name: User's full name (firstName + lastName), null if user not found
   * - isTyping: Real-time typing indicator status for this chat
   */
  participants: Participant[];

  /**
   * Count of unread messages for the authenticated user in this chat.
   * Computed by querying messageStatusTable for entries where userId matches
   * the authenticated user and read = false, then counting those belonging
   * to this chat via the message → chat relation.
   */
  unreadMessages: number;
};

// ===== Message =====

export type MessageSelect = typeof messageTable.$inferSelect;

export type MessageInsert = typeof messageTable.$inferInsert;

export enum MessageStatusEnum {
  /** Message is being sent to server */
  SENDING = "SENDING",
  /** Message successfully delivered to server */
  SENT = "SENT",
  /** Message read by all participants in a chat */
  READ = "READ",
  /** Message failed to send */
  ERROR = "ERROR",
}

type MessageReads = { userId: string; userName: string; read: boolean };

export type MessageDTO = MessageSelect & {
  senderName: string | null;
  status: MessageStatusEnum;
  reads: MessageReads[]; // all reads of message except sender because sender already read it
};

// ===== Log =====

export type LogInsert = typeof logTable.$inferInsert;

// ===== Shared / Pagination =====

type Pagination = { hasMore: boolean; pageNumber: number };
