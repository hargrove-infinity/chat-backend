import { db } from "../db";
import { logTable, type NewLog } from "../db/schema";

async function create(logModel: NewLog | NewLog[]) {
  const values = Array.isArray(logModel) ? logModel : [logModel];
  const createdLogs = await db.insert(logTable).values(values).returning();
  return createdLogs;
}

export const logRepository = {
  create,
} as const;
