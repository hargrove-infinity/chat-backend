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
  // Client → Server: User sends a message
  SEND_MESSAGE: "chat:send_message",
  // Server → Client(s): Broadcast new message to chat participants
  NEW_MESSAGE: "chat:new_message",
} as const;
