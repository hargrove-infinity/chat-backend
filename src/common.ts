import "dotenv/config";
import { envSchema } from "./validation";

export const envVariables = envSchema.parse({
  port: process.env.PORT,
  frontendUrl: process.env.FRONTEND_URL,
});
