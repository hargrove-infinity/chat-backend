import type { DB, User } from "../../../_mock/types";
import { CONNECTION_EVENTS } from "../../../common/socket";
import { getDirectInterlocutorSocketIds } from "../chat.helpers";
import type { ChatSocket } from "../chat.types";

type DisconnectHandlerArgs = { db: DB; user: User; socket: ChatSocket };

export const disconnectHandler = (args: DisconnectHandlerArgs) => () => {
  const { db, user, socket } = args;

  user.socketId = null;

  const interlocutorSocketIds = getDirectInterlocutorSocketIds({
    db,
    userId: user.id,
  });

  if (interlocutorSocketIds.length) {
    socket.to(interlocutorSocketIds).emit(CONNECTION_EVENTS.OFFLINE, user.id);
  }
};
