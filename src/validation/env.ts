import { z } from "zod";

export const envSchema = z.object({
  port: z.string().transform((val) => parseInt(val, 10)),
  databaseUrl: z.url(),
  redisUrl: z.url(),
  frontendUrl: z.url(),
  sendEmailApiKey: z.string().min(1),
  sendEmailFrom: z.email(),
  betterAuthUrl: z.url(),
  betterAuthSecret: z.string().min(32),
});
