import type { userTable } from "../db/schema";

export type User = typeof userTable.$inferSelect;
export type UserInsert = typeof userTable.$inferInsert;

export type UserFilter = Partial<User>;
export type UserPatch = Partial<UserInsert>;
export type UserKey = keyof User