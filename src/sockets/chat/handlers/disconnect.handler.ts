import { CONNECTION_EVENTS } from "../../../common/socket";
import { userRepository } from "../../../repositories/user.repository";
import type { ChatSocket } from "../chat.types";

type DisconnectHandlerArgs = {
  userId: string;
  socket: ChatSocket;
};

export const disconnectHandler = (args: DisconnectHandlerArgs) => async () => {
  const { userId, socket } = args;

  // TODO: remove later
  await userRepository.updateBy({
    where: { id: userId },
    set: { socketId: null },
  });

  // TODO: uncomment later
  // await presenceService.deletePresence(userId);

  // TODO: remove later
  const interlocutorSocketIds =
    await userRepository.findOnlineDirectInterlocutorsSocketIds(userId);

  if (interlocutorSocketIds.length) {
    socket.to(interlocutorSocketIds).emit(CONNECTION_EVENTS.OFFLINE, userId);
  }

  // TODO: uncomment later
  // const interlocutorIds =
  //   await userRepository.findDirectInterlocutorIds(userId);

  // const interlocutorSocketIds =
  //   await presenceService.getSocketIds(interlocutorIds);

  // const onlineInterlocutorSocketIds = interlocutorSocketIds.filter(
  //   (id): id is string => id !== null,
  // );

  // if (onlineInterlocutorSocketIds.length) {
  //   socket
  //     .to(onlineInterlocutorSocketIds)
  //     .emit(CONNECTION_EVENTS.OFFLINE, userId);
  // }
};
