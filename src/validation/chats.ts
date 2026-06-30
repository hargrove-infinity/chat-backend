import { z } from "zod";

export const queryParamsChatIdSchema = z.object({ chatId: z.uuid() });
