import type { Namespace, Socket } from "socket.io";
import { CHAT_EVENTS, CONNECTION_EVENTS } from "../../common/socket";
import type { MessageDTO } from "../../db/types";

/* ====================== PAYLOAD TYPES ====================== */

/**
 * Payload broadcast to other users when someone is starts/stops typing
 * Contains both the chat and the user who is typing
 */
type TypingBroadcastPayload = {
  chatId: string;
  userId: string;
};

/**
 * Payload sent from client when sending a new message
 */
export type ChatMessagePayload = {
  content: string;
  chatId: string;
  /**
   * Temporary ID generated on the client for optimistic UI updates.
   * Used to match the optimistic message with the real server-generated message.
   */
  tempId: string;
};

/**
 * Generic payload for read receipt events.
 * Used in both directions:
 * - Client → Server: when reader reads message
 * - Server → Client: when notifying the author that their message was read
 */
export type ReadReceiptPayload = {
  readerId: string;
  messageIds: string[];
};

/** Successful acknowledgment — server confirmed the message was stored and returns the real message */
type SendMessageAckSuccess = {
  ok: true;
  tempId: string;
  /** Server-generated message with real ID and timestamps */
  message: MessageDTO;
};

/** Failed acknowledgment — server rejected the message and returns an error description */
type SendMessageAckFailure = {
  ok: false;
  tempId: string;
  /** Error message describing why the send failed */
  error: string;
};

/**
 * Acknowledgment response from server after sending a message
 * Discriminated union based on success/failure
 */
type SendMessageAck = SendMessageAckSuccess | SendMessageAckFailure;

/**
 * Callback function type for Socket.IO message acknowledgment
 */
export type SendMessageCallback = (res: SendMessageAck) => void;

/* ====================== SERVER → CLIENT EVENTS ====================== */

/**
 * Events emitted from server to client in the chat namespace
 * These events are broadcast to clients to notify them of changes
 */
type ServerToClientEventsChatsNamespace = {
  [CONNECTION_EVENTS.CONNECTED]: () => void;
  [CONNECTION_EVENTS.ONLINE]: (userId: string) => void;
  [CHAT_EVENTS.NEW_MESSAGE]: (message: MessageDTO) => void;
  [CHAT_EVENTS.START_TYPING_BROADCAST]: (
    payload: TypingBroadcastPayload,
  ) => void;
  [CHAT_EVENTS.STOP_TYPING_BROADCAST]: (
    payload: TypingBroadcastPayload,
  ) => void;
  [CONNECTION_EVENTS.OFFLINE]: (userId: string) => void;
  [CHAT_EVENTS.NOTIFY_AUTHOR_MESSAGE_WAS_READ]: (
    payload: ReadReceiptPayload,
  ) => void;
};

/* ====================== CLIENT → SERVER EVENTS ====================== */

/**
 * Events emitted from client to server in the chat namespace
 * These events are triggered by client actions and handled on the server
 */
type ClientToServerEventsChatsNamespace = {
  [CHAT_EVENTS.SEND_MESSAGE]: (
    payload: ChatMessagePayload,
    callback: SendMessageCallback,
  ) => void;
  [CHAT_EVENTS.START_TYPING_DISPATCH]: (chatId: string) => void;
  [CHAT_EVENTS.STOP_TYPING_DISPATCH]: (chatId: string) => void;
  [CHAT_EVENTS.MESSAGE_WAS_READ]: (payload: ReadReceiptPayload) => void;
};

/* ====================== TYPED SOCKET & NAMESPACE ====================== */

/**
 * Typed Socket.IO socket for chat namespace
 * Provides type-safe event handlers for both client-to-server and server-to-client events
 */
export type ChatSocket = Socket<
  ClientToServerEventsChatsNamespace,
  ServerToClientEventsChatsNamespace
>;

/**
 * Typed Socket.IO namespace for chat functionality
 * Used to initialize and manage the chat namespace with type-safe event definitions
 */
export type ChatNamespace = Namespace<
  ClientToServerEventsChatsNamespace,
  ServerToClientEventsChatsNamespace
>;
