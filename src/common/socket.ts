export const CHAT_NAMESPACE = "/chat";
export const ADMIN_NAMESPACE = "/admin";

export const WELCOME_EVENTS = {
  ADMIN: "welcome:admin",
  CHAT: "welcome:chat",
} as const;

export const CONNECTION_EVENTS = {
  ADMIN: "connection:admin",
  ONLINE: "connection:online",
  OFFLINE: "connection:offline",
} as const;

export const ADMIN_EVENTS = {
  METRICS: "admin:metrics",
} as const;

export const CHAT_EVENTS = {
  MESSAGE: "chat:message",
} as const;
