import type { userTable } from "../db/schema";

export type UserSelect = typeof userTable.$inferSelect;
export type UserInsert = typeof userTable.$inferInsert;

export type UserFilterFields = Partial<UserSelect>;
export type UserPatchFields = Partial<UserInsert>;
export type UserColumnNames = keyof UserSelect;

export type UserUpdateByArgs = {
  where: UserFilterFields;
  set: UserPatchFields;
};
