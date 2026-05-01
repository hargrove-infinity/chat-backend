import { and, eq, type SQL } from "drizzle-orm";
import { userTable } from "../db/schema";
import type {
  UserColumnNames,
  UserFilterFields,
} from "./user.repository.types";

export function buildWhereClause(where: UserFilterFields): SQL | undefined {
  const conditions: SQL[] = [];
  const keys = Object.keys(where) as UserColumnNames[];
  for (const key of keys) {
    const value = where[key];
    if (value === undefined) continue;
    conditions.push(eq(userTable[key], value as never));
  }
  return conditions.length ? and(...conditions) : undefined;
}
