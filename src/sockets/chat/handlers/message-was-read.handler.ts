import { CHAT_EVENTS } from "../../../common/socket";
import { processMessageReadReceipt } from "../chat.helpers";
import type { ChatSocket, ReadReceiptPayload } from "../chat.types";

export const messageWasReadHandler =
  (socket: ChatSocket) => async (payload: ReadReceiptPayload) => {
    const authorNotifications = await processMessageReadReceipt(payload);

    if (authorNotifications.length) {
      for (const notification of authorNotifications) {
        socket
          .to(notification.authorSocketId)
          .emit(CHAT_EVENTS.NOTIFY_AUTHOR_MESSAGE_WAS_READ, {
            readerId: notification.readerId,
            messageIds: notification.messageIds,
          });
      }
    }
  };
