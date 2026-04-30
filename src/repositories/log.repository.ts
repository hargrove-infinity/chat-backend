import { db } from "../db";
import { logTable, type NewLog } from "../db/schema";

async function create(logModels: NewLog[]) {
  const createdLogs = await db.insert(logTable).values(logModels).returning();
  return createdLogs;
}

export const logRepository = {
  create,
} as const;
