import { db } from "../db";

type UserFindFirst = typeof db.query.userTable.findFirst;
type UserFindFirstConfig = Parameters<UserFindFirst>[0];
export type UserWhere = NonNullable<UserFindFirstConfig>['where'];