export const CHAT_NAMESPACE = "/chat";
export const ADMIN_NAMESPACE = "/admin";

export const CONNECTION_EVENTS = {
  ONLINE: "connection:online",
  OFFLINE: "connection:offline",
  /**
   * Emitted by the server to the client immediately upon connection.
   * Purpose: initializes the offset on the client side, which is required
   * for connection state recovery to succeed on reconnection.
   * Without at least one server → client event, the client has no offset
   * to send back to the server, making session recovery impossible.
   * @see https://socket.io/docs/v4/connection-state-recovery
   */
  CONNECTED: "connection:connected",
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

  /**
   * Read message events
   */

  // Client → Server: Reader reads message(s) (sent when the user views unread messages)
  MESSAGE_WAS_READ: "chat:message_was_read",
  // Server → Client(s) (to the author(s)): Notifies the message author(s) that their message was read by the interlocutor
  NOTIFY_AUTHOR_MESSAGE_WAS_READ: "chat:notify_author_message_was_read",
} as const;
