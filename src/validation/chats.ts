import { z } from "zod";

export const queryParamsChatIdSchema = z.object({ chatId: z.uuid() });

export type QueryParamsChatIdInput = z.infer<typeof queryParamsChatIdSchema>;
