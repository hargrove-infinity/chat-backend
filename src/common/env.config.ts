import "dotenv/config";
import { envSchema } from "../validation/env";

export const envVariables = envSchema.parse({
  port: process.env.PORT,
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  frontendUrl: process.env.FRONTEND_URL,
  sendEmailApiKey: process.env.SEND_EMAIL_API_KEY,
  sendEmailFrom: process.env.SEND_EMAIL_FROM,
  betterAuthUrl: process.env.BETTER_AUTH_URL,
  betterAuthSecret: process.env.BETTER_AUTH_SECRET,
});
