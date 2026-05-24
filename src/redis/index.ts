import Redis from "ioredis";
import { envVariables } from "../common/env.config";
import { logger } from "../logger";

// TODO: What to use ioredis or node-redis?
// TODO: Redis doc recommends to use node-redis
export const redis = new Redis(envVariables.redisUrl);

export async function checkRedisConnection() {
  try {
    logger.info("Checking Redis connection...");
    await redis.ping();
    logger.info("Redis connection successful");
  } catch (error) {
    logger.error({ error }, "Redis connection failed");
    throw error;
  }
}
