import { db } from "../db";
import { type LogInsert, logTable } from "../db/schema";

async function create(logModels: LogInsert[]) {
  const createdLogs = await db.insert(logTable).values(logModels).returning();
  return createdLogs;
}

export const logRepository = {
  create,
} as const;
