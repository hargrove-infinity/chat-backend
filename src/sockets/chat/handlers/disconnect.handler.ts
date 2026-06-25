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

  const [, deletePresenceError] = await presenceService.deletePresence({
    userId,
    socketId: socket.id,
  });

  if (deletePresenceError) {
    logger.warn(
      { error: deletePresenceError.message },
      "Failed to delete presence in Redis in socket disconnect handler",
    );

    throw new Error("Unknown error");
  }

  const [interlocutorIds, errorInterlocutorIds] =
    await usersService.findDirectInterlocutorIds(userId);

  if (errorInterlocutorIds) {
    logger.warn(
      { error: errorInterlocutorIds.message, userId },
      "Failed to fetch direct interlocutor ids in socket disconnect handler",
    );

    throw new Error("Unknown error");
  }

  const [onlineInterlocutorSocketIds, onlineInterlocutorSocketIdsError] =
    await presenceService.getSocketIdList(interlocutorIds);

  if (onlineInterlocutorSocketIdsError) {
    logger.warn(
      { error: onlineInterlocutorSocketIdsError.message },
      "Failed to fetch online interlocutor socket ids from Redis in socket disconnect handler",
    );

    throw new Error("Unknown error");
  }

  if (onlineInterlocutorSocketIds.length) {
    socket
      .to(onlineInterlocutorSocketIds)
      .emit(CONNECTION_EVENTS.OFFLINE, userId);
  }
};
