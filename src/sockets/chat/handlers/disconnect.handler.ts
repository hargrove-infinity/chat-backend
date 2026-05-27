import { CONNECTION_EVENTS } from "../../../common/socket";
import { userRepository } from "../../../repositories/user.repository";
import { presenceService } from "../../../services/presence.service";
import type { ChatSocket } from "../chat.types";

type DisconnectHandlerArgs = {
  userId: string;
  socket: ChatSocket;
};

export const disconnectHandler = (args: DisconnectHandlerArgs) => async () => {
  const { userId, socket } = args;

  await presenceService.deletePresence(userId);

  const interlocutorIds =
    await userRepository.findDirectInterlocutorIds(userId);

  const onlineInterlocutorSocketIds =
    await presenceService.getSocketIdList(interlocutorIds);

  if (onlineInterlocutorSocketIds.length) {
    socket
      .to(onlineInterlocutorSocketIds)
      .emit(CONNECTION_EVENTS.OFFLINE, userId);
  }
};
