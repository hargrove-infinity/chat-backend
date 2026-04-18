import type { AnyColumn, InferSelectModel } from "drizzle-orm";
import { db } from "../db";
import type { messageTable } from "../db/schema";
import { logger } from "../logger";
import { asyncTryCatch } from "../util/asyncTryCatch";
import { buildConditions, type Filters } from "./helpers.repository";

type Message = InferSelectModel<typeof messageTable>;

type ExtractColumns<T> = {
  [K in keyof T]: T[K] extends AnyColumn ? T[K] : never;
};

type MessageColumns = ExtractColumns<typeof messageTable>;

async function findMany(
  filters?: Filters<MessageColumns>,
): Promise<[Message[] | null, null] | [null, Error]> {
  logger.info("Getting messages from database...");
  const res = db.query.messageTable.findMany({
    where: (user) => buildConditions(user, filters),
  });

  const [data, error] = await asyncTryCatch(res);

  if (error) {
    logger.error(
      { error: error.message },
      "Error during getting messages from database",
    );

    return [null, new Error("Error during finding messages in database")];
  }

  logger.info("Messages successfully fetched from database");
  return [data ?? null, null];
}

export const messageRepository = {
  findMany,
} as const;
