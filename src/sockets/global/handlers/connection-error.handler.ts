import { v4 as uuidv4 } from "uuid";
import type { DB } from "../../../_mock/types";

export const connectionErrorHandler = (db: DB) => (error: Error) => {
  db.logs = [
    ...db.logs,
    {
      id: uuidv4(),
      message: error?.message ?? null,
      name: error?.name ?? null,
      socketId: null,
      userId: null,
      event: "global_server_event",
      namespace: "io",
      source: "server",
      timestamp: new Date().toISOString(),
    },
  ];
};
