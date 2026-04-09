import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { envVariables } from "../common/env.config";
import { logger } from "../logger";

export const db = drizzle(envVariables.databaseUrl);

export async function checkConnection() {
  try {
    await db.execute(sql`SELECT 1`);
    logger.info("Database connection successful");
  } catch (error) {
    logger.error({ error }, "Database connection failed");
    throw error;
  }
}
