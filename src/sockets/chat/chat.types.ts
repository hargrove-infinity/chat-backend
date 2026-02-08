import type { MessageDTO } from "../../_mock/types";

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
export type SendMessageAck =
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
