import type { Namespace, Socket } from "socket.io";
import type { MessageDTO } from "../../_mock/types";
import { CHAT_EVENTS, CONNECTION_EVENTS } from "../../common/socket";

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
};

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
};

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

/**
 * Payload broadcast to other users when someone is typing
 * Contains both the chat and the user who is typing
 */
type TypingBroadcastPayload = { chatId: string; userId: string };

/**
 * Payload sent from client when sending a message
 */
export type ChatMessagePayload = {
  content: string;
  chatId: string;
  /**
   * Temporary ID generated on the client for optimistic UI updates
   * Used to match the optimistic message with the server response
   */
  tempId: string;
};

/**
 * Acknowledgment response from server after sending a message
 * Discriminated union based on success/failure
 */
type SendMessageAck =
  | {
      ok: true;
      tempId: string;
      /** Server-generated message with real ID and timestamps */
      message: MessageDTO;
    }
  | {
      ok: false;
      tempId: string;
      /** Error message describing why the send failed */
      error: string;
    };

/**
 * Callback function type for Socket.IO message acknowledgment
 */
export type SendMessageCallback = (res: SendMessageAck) => void;
