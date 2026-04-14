import type { InferSelectModel } from "drizzle-orm";
import { db } from "../db";
import type { userTable } from "../db/schema";
import { logger } from "../logger";
import { asyncTryCatch } from "../util/asyncTryCatch";

type FindFirstArgs = NonNullable<
  Parameters<typeof db.query.userTable.findFirst>[0]
>;

type User = InferSelectModel<typeof userTable>;

async function findFirst(
  args?: FindFirstArgs,
): Promise<[User | null, null] | [null, Error]> {
  const res = db.query.userTable.findFirst(args);
  logger.info("Getting first user from database...");
  const [data, error] = await asyncTryCatch<User | undefined>(res);

  if (error) {
    logger.error(
      { error: error.message },
      "Error during getting first user from database",
    );

    return [null, new Error("Error during finding first user in database")];
  }

  logger.info("First user successfully fetched from database");
  return [data ?? null, null];
}

export const userRepository = {
  findFirst,
} as const;
