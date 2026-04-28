import { userTable } from "../db/schema";
import type { AnyColData, UserTableColumnNames } from "./user.repository.types";

export function isUserColumnEntry(
  entry: [string, unknown],
): entry is [UserTableColumnNames, AnyColData] {
  return entry[0] in userTable;
}
