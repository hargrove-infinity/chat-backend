import { z } from "zod";

export const envSchema = z.object({
  port: z.string().transform((val) => parseInt(val, 10)),
  databaseUrl: z.string().nonempty(),
  frontendUrl: z.url(),
});
