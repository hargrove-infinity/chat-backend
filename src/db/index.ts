import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { envVariables } from "../common/env.config";
import { logger } from "../logger";
import * as schema from "./schema";

const pool = new Pool({ connectionString: envVariables.databaseUrl });

export const db = drizzle(pool, { schema });

export async function checkConnection() {
  try {
    await db.execute(sql`SELECT 1`);
    logger.info("Database connection successful");
  } catch (error) {
    logger.error({ error }, "Database connection failed");
    throw error;
  }
}
