import type { userTable } from "../db/schema";

type UserTableColumns = typeof userTable._.columns;

export type UserTableColumnNames = keyof UserTableColumns;

type ColMeta<K extends UserTableColumnNames> = UserTableColumns[K]["_"];
type ColData<K extends UserTableColumnNames> = ColMeta<K>["data"];
type ColNotNull<K extends UserTableColumnNames> = ColMeta<K>["notNull"];

export type UserColumnValueMap = Partial<{
  [K in UserTableColumnNames]: ColNotNull<K> extends true
    ? ColData<K>
    : ColData<K> | null;
}>;

export type AnyColData = ColData<UserTableColumnNames>;

export type UpdateByArgs = {
  set: UserColumnValueMap;
  where: UserColumnValueMap;
};
