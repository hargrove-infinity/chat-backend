import { db } from "../db";
import { logTable } from "../db/schema";
import type { LogInsert } from "../db/types";

async function create(logModels: LogInsert[]) {
  const createdLogs = await db.insert(logTable).values(logModels).returning();
  return createdLogs;
}

export const logRepository = {
  create,
} as const;
