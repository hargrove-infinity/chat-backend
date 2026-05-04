import { z } from "zod";

const logSchema = z.object({
  socketId: z.string().nullable(),
  userId: z.string().nullable(),
  event: z.string(),
  message: z.string().nullable(),
  name: z.string().nullable(),
  namespace: z.string().nullable(),
  source: z.string().nullable(),
  timestamp: z.coerce.date(),
});

export const logArraySchema = z.array(logSchema);

export type LogArrayInput = z.infer<typeof logArraySchema>;
