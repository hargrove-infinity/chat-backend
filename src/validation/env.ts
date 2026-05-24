import { z } from "zod";

export const envSchema = z.object({
  port: z.string().transform((val) => parseInt(val, 10)),
  // TODO: remake validation so check url
  databaseUrl: z.string().nonempty(),
  // TODO: remake validation so check url
  redisUrl: z.string().nonempty(),
  frontendUrl: z.url(),
});
