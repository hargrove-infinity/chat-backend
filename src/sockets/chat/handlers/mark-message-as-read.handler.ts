import type { DB } from "../../../_mock/types";

export const markMessageAsReadHandler = (db: DB) => (messageIds: string[]) => {
  db.readEvents = db.readEvents.map((readEvent) => {
    if (messageIds.includes(readEvent.messageId)) {
      return {
        ...readEvent,
        read: true,
        updatedAt: new Date().toISOString(),
      };
    }

    return readEvent;
  });
};
