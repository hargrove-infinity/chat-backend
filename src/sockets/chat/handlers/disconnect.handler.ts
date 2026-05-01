import { CONNECTION_EVENTS } from "../../../common/socket";
import { userRepository } from "../../../repositories/user.repository";
import type { ChatSocket } from "../chat.types";

type DisconnectHandlerArgs = {
  userId: string;
  socket: ChatSocket;
};

export const disconnectHandler = (args: DisconnectHandlerArgs) => async () => {
  const { userId, socket } = args;

  await userRepository.updateBy({
    where: { id: userId },
    set: { socketId: null },
  });

  const interlocutorSocketIds =
    await userRepository.findOnlineDirectInterlocutorsSocketIds(userId);

  if (interlocutorSocketIds.length) {
    socket.to(interlocutorSocketIds).emit(CONNECTION_EVENTS.OFFLINE, userId);
  }
};
