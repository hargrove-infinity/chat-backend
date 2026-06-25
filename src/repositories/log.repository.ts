import { db } from "../db";
import { logTable } from "../db/schema";
import type { LogInsert } from "../db/types";
import { logger } from "../logger";
import { asyncTryCatch } from "../util/asyncTryCatch";

async function create(logModels: LogInsert[]) {
  logger.info("Inserting logs into database");

  const [rows, error] = await asyncTryCatch(
    db.insert(logTable).values(logModels).returning(),
  );

  if (error) {
    logger.error("Database error while inserting logs into database");

    return [null, error] as const;
  }

  logger.info("Logs successfully inserted into database");

  return [rows, null] as const;
}

export const logRepository = {
  create,
} as const;
