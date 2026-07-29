import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { chatParticipantsTable, chatTable } from "../db/schema";

export const queryParamsChatIdSchema = z.object({ chatId: z.uuid() });

export type QueryParamsChatIdInput = z.infer<typeof queryParamsChatIdSchema>;

const chatParticipantInsertSchema = createInsertSchema(
  chatParticipantsTable,
).omit({ chatId: true });

export const insertChatSchema = createInsertSchema(chatTable)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    participantIds: z.array(chatParticipantInsertSchema.shape.userId),
  });

export type InsertChatInput = z.infer<typeof insertChatSchema>;
