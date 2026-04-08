import { drizzle } from "drizzle-orm/neon-http";
import { envVariables } from "../common/env.config";

export const db = drizzle(envVariables.databaseUrl);
