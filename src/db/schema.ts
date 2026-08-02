import { relations } from "drizzle-orm";
import {
  boolean,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const chatType = pgEnum("chat_type", ["DIRECT", "GROUP"]);

// Tables
export const userTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  // Required by Better Auth as the user's display name
  name: text("name").notNull(),
  // Required by Better Auth to gate access until the user confirms their email
  isEmailVerified: boolean("is_email_verified").default(false).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

// Stores email/password credentials and OAuth provider connections for each user (Better Auth's account table)
export const accountTable = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", {
    precision: 6,
    withTimezone: true,
  }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
    precision: 6,
    withTimezone: true,
  }),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

// Stores active login sessions and their tokens (Better Auth's session table)
export const sessionTable = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at", {
    precision: 6,
    withTimezone: true,
  }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

// Stores short-lived tokens for email verification and password reset flows (Better Auth's verification table)
export const verificationTable = pgTable("verifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", {
    precision: 6,
    withTimezone: true,
  }).notNull(),
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
