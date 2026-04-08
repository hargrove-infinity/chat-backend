import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { envVariables } from "./src/common/env.config";

export default defineConfig({
  out: "./drizzle/migrations",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: { url: envVariables.databaseUrl },
});
