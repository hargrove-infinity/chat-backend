import { eq } from "drizzle-orm";
import { db } from "../db";
import { userTable } from "../db/schema";

async function findFirstByEmail(email: string) {
  const user = await db.query.userTable.findFirst({
    where: eq(userTable.email, email),
  });

  return user;
}

export const userRepository = {
  findFirstByEmail,
} as const;
