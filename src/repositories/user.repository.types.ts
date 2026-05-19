import type { UserInsert, UserSelect } from "../db/types";

export type UserFilterFields = Partial<UserSelect>;
export type UserPatchFields = Partial<UserInsert>;
export type UserColumnNames = keyof UserSelect;

export type UserUpdateByArgs = {
  where: UserFilterFields;
  set: UserPatchFields;
};
