import type { AnyColumn, InferSelectModel } from "drizzle-orm";
import { db } from "../db";
import type { userTable } from "../db/schema";
import { logger } from "../logger";
import { asyncTryCatch } from "../util/asyncTryCatch";
import { buildConditions, type Filters } from "./helpers.repository";

type User = InferSelectModel<typeof userTable>;

type ExtractColumns<T> = {
  [K in keyof T]: T[K] extends AnyColumn ? T[K] : never;
};

type UserColumns = ExtractColumns<typeof userTable>;

async function findFirst(
  filters?: Filters<UserColumns>,
): Promise<[User | null, null] | [null, Error]> {
  logger.info("Getting first user from database...");
  const res = db.query.userTable.findFirst({
    where: (user) => buildConditions(user, filters),
  });

  const [data, error] = await asyncTryCatch(res);

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
