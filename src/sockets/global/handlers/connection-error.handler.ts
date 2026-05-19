import { logRepository } from "../../../repositories/log.repository";

export const connectionErrorHandler = () => async (error: Error) => {
  const errorLog = {
    message: error?.message ?? null,
    name: error?.name ?? null,
    socketId: null,
    userId: null,
    event: "global_server_event",
    namespace: "io",
    source: "server",
  };

  await logRepository.create([errorLog]);
};
