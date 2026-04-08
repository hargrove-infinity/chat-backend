import "dotenv/config";
import { envSchema } from "../validation/env";

export const envVariables = envSchema.parse({
  port: process.env.PORT,
  databaseUrl: process.env.DATABASE_URL,
  frontendUrl: process.env.FRONTEND_URL,
});
