import "dotenv/config";
import { envSchema } from "./validation";

export const envVariables = envSchema.parse({
  port: process.env.PORT,
  frontendUrl: process.env.FRONTEND_URL,
});

export const paths = {
  auth: {
    login: "/login",
  },
  chats: {
    list: "/chats",
    messagesByChatId: "/chats/:chatId/messages",
  },
};

export const CHAT_NAMESPACE = "/chat";
export const ADMIN_NAMESPACE = "/admin";

export const WELCOME_EVENTS = {
  ADMIN: "welcome:admin",
  CHAT: "welcome:chat",
} as const;

export const CONNECTION_EVENTS = {
  ADMIN: "connection:admin",
  CHAT: "connection:chat",
} as const;

export const ADMIN_EVENTS = {
  MESSAGE: "admin:message",
  METRICS: "admin:metrics",
} as const;

export const CHAT_EVENTS = {
  MESSAGE: "chat:message",
} as const;
