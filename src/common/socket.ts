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
  /**
   * Sending/Receiving message events
   */

  // Client → Server: User sends a message
  SEND_MESSAGE: "chat:send_message",
  // Server → Client(s): Broadcast new message to chat participants
  NEW_MESSAGE: "chat:new_message",

  /**
   * Typing events
   */

  // Client → Server: User starts typing
  START_TYPING_DISPATCH: "chat:start_typing_dispatch",
  // Client → Server: User stops typing
  STOP_TYPING_DISPATCH: "chat:stop_typing_dispatch",

  // Server → Client(s): Broadcast start typing to chat participants
  START_TYPING_BROADCAST: "chat:start_typing_broadcast",
  // Server → Client(s): Broadcast stop typing to chat participants
  STOP_TYPING_BROADCAST: "chat:stop_typing_broadcast",
} as const;
