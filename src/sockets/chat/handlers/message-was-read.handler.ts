import type { DB } from "../../../_mock/types";
import { CHAT_EVENTS } from "../../../common/socket";
import { processMessageReadReceipt } from "../chat.helpers";
import type { ChatSocket, ReadReceiptPayload } from "../chat.types";

type MessageWasReadHandlerArgs = { db: DB; socket: ChatSocket };

export const messageWasReadHandler =
  (args: MessageWasReadHandlerArgs) => (payload: ReadReceiptPayload) => {
    const { db, socket } = args;

    const authorNotifications = processMessageReadReceipt({ db, payload });

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
