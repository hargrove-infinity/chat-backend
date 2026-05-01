import { relations } from "drizzle-orm";
import {
  boolean,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const chatType = pgEnum("chat_type", ["DIRECT", "GROUP"]);

// Tables
export const userTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  socketId: text("socket_id"),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const chatTable = pgTable("chats", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: chatType().notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const messageTable = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  chatId: uuid("chat_id")
    .notNull()
    .references(() => chatTable.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => userTable.id, {
    onDelete: "set null",
  }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

export const messageStatusTable = pgTable(
  "message_status",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    messageId: uuid("message_id")
      .notNull()
      .references(() => messageTable.id, { onDelete: "cascade" }),
    read: boolean("read").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [primaryKey({ columns: [table.userId, table.messageId] })],
);

export const logTable = pgTable("logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  socketId: text("socket_id"),
  userId: uuid("user_id").references(() => userTable.id, {
    onDelete: "set null",
  }),
  event: text("event").notNull(),
  message: text("message"),
  name: text("name"),
  namespace: text("namespace"),
  source: text("source"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const chatParticipantsTable = pgTable(
  "chat_participants",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
    chatId: uuid("chat_id")
      .notNull()
      .references(() => chatTable.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.userId, table.chatId] })],
);

// Relations
export const userRelations = relations(userTable, ({ many }) => ({
  chatParticipants: many(chatParticipantsTable),
  messages: many(messageTable),
  messageStatuses: many(messageStatusTable),
  logs: many(logTable),
}));

export const chatRelations = relations(chatTable, ({ many }) => ({
  chatParticipants: many(chatParticipantsTable),
  messages: many(messageTable),
}));

export const chatParticipantsRelations = relations(
  chatParticipantsTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [chatParticipantsTable.userId],
      references: [userTable.id],
    }),
    chat: one(chatTable, {
      fields: [chatParticipantsTable.chatId],
      references: [chatTable.id],
    }),
  }),
);

export const messageRelations = relations(messageTable, ({ one, many }) => ({
  messageStatuses: many(messageStatusTable),
  sender: one(userTable, {
    fields: [messageTable.userId],
    references: [userTable.id],
  }),
  chat: one(chatTable, {
    fields: [messageTable.chatId],
    references: [chatTable.id],
  }),
}));

export const messageStatusRelations = relations(
  messageStatusTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [messageStatusTable.userId],
      references: [userTable.id],
    }),
    message: one(messageTable, {
      fields: [messageStatusTable.messageId],
      references: [messageTable.id],
    }),
  }),
);

export const logRelations = relations(logTable, ({ one }) => ({
  user: one(userTable, {
    fields: [logTable.userId],
    references: [userTable.id],
  }),
}));

// Types
export type UserSelect = typeof userTable.$inferSelect;

export type UserInsert = typeof userTable.$inferInsert;

export type ChatSelect = typeof chatTable.$inferSelect;

export type MessageSelect = typeof messageTable.$inferSelect;

export type MessageInsert = typeof messageTable.$inferInsert;

export type LogInsert = typeof logTable.$inferInsert;

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
