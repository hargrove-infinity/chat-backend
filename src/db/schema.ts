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

//?
// 7. Is read_events a good table name, or is there a more expressive alternative?
export const readEventTable = pgTable(
  "read_events",
  {
    userId: uuid("user_id").notNull(),
    messageId: uuid("message_id").notNull(),
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
      .references(() => userTable.id),
    chatId: uuid("chat_id")
      .notNull()
      .references(() => chatTable.id),
  },
  (table) => [primaryKey({ columns: [table.userId, table.chatId] })],
);

// Relations
export const userRelations = relations(userTable, ({ many }) => ({
  chatParticipants: many(chatParticipantsTable),
  messages: many(messageTable),
  readEvents: many(readEventTable),
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
  readEvents: many(readEventTable),
  sender: one(userTable, {
    fields: [messageTable.userId],
    references: [userTable.id],
  }),
  chat: one(chatTable, {
    fields: [messageTable.chatId],
    references: [chatTable.id],
  }),
}));

export const readEventRelations = relations(readEventTable, ({ one }) => ({
  user: one(userTable, {
    fields: [readEventTable.userId],
    references: [userTable.id],
  }),
  message: one(messageTable, {
    fields: [readEventTable.messageId],
    references: [messageTable.id],
  }),
}));

export const logRelations = relations(logTable, ({ one }) => ({
  user: one(userTable, {
    fields: [logTable.userId],
    references: [userTable.id],
  }),
}));
