import { CONNECTION_EVENTS } from "../../../common/socket";
import { logger } from "../../../logger";
import { presenceService } from "../../../services/presence.service";
import { usersService } from "../../../services/users.service";
import type { ChatSocket } from "../chat.types";

type DisconnectHandlerArgs = {
  userId: string;
  socket: ChatSocket;
};

export const disconnectHandler = (args: DisconnectHandlerArgs) => async () => {
  const { userId, socket } = args;

  await presenceService.deletePresence({ userId, socketId: socket.id });

  const [interlocutorIds, errorInterlocutorIds] =
    await usersService.findDirectInterlocutorIds(userId);

  if (errorInterlocutorIds) {
    logger.warn(
      { error: errorInterlocutorIds.message, userId },
      "Failed to fetch direct interlocutor ids in socket disconnect handler",
    );

    throw new Error("Unknown error");
  }

  const onlineInterlocutorSocketIds =
    await presenceService.getSocketIdList(interlocutorIds);

  if (onlineInterlocutorSocketIds.length) {
    socket
      .to(onlineInterlocutorSocketIds)
      .emit(CONNECTION_EVENTS.OFFLINE, userId);
  }
};
