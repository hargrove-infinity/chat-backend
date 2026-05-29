import { logger } from "../logger";
import { redis } from "../redis";

const keys = {
  user: (userId: string) => `presence:user:${userId}`,
  socket: (socketId: string) => `presence:socket:${socketId}`,
};

type HandlePresenceArgs = { userId: string; socketId: string };

async function setPresence(args: HandlePresenceArgs): Promise<void> {
  const { socketId, userId } = args;
  logger.info(`[T1] setPresence userId: ${userId} → socketId: ${socketId}`);
  logger.info(`[T1] setPresence socketId: ${socketId} → userId: ${userId}`);

  await redis
    .pipeline()
    .set(keys.user(userId), socketId)
    .set(keys.socket(socketId), userId)
    .exec();

  logger.info(`[T1/T4] setPresence done`);
}

async function getUserId(socketId: string): Promise<string | null> {
  return await redis.get(keys.socket(socketId));
}

/**
 * Returns only online users as { userId → socketId }.
 * Offline users are simply absent from the map.
 */
async function getSocketIdMap(
  userIds: string[],
): Promise<Record<string, string>> {
  if (userIds.length === 0) return {};

  const pipeline = redis.pipeline();

  for (const userId of userIds) {
    pipeline.get(keys.user(userId));
  }

  const results = (await pipeline.exec()) ?? [];

  const userSocketIdMap: Record<string, string> = {};

  results.forEach(([error, value], i) => {
    const userId = userIds[i];
    if (!userId) return;
    if (!error && typeof value === "string") {
      userSocketIdMap[userId] = value;
    }
  });

  return userSocketIdMap;
}

/**
 * Returns socket IDs of online users only, offline users are excluded.
 */
async function getSocketIdList(userIds: string[]): Promise<string[]> {
  if (userIds.length === 0) return [];

  const pipeline = redis.pipeline();

  for (const userId of userIds) {
    pipeline.get(keys.user(userId));
  }

  const results = (await pipeline.exec()) ?? [];

  return results.reduce<string[]>((acc, [error, value]) => {
    if (!error && typeof value === "string") {
      acc.push(value);
    }
    return acc;
  }, []);
}

async function deletePresence(args: HandlePresenceArgs): Promise<void> {
  const { socketId, userId } = args;
  logger.info(`[T3] deletePresence started for userId: ${userId}`);

  await new Promise((resolve) => setTimeout(resolve, 3000));

  logger.info(
    `[T6] deletePresence woke up, reading current socketId for userId: ${userId}`,
  );

  logger.info(`[T7] got socketId: ${socketId}`);

  const currentSocketId = await redis.get(keys.user(userId));

  if (currentSocketId !== socketId) {
    // A new connection has already taken over — only clean up the old socket key
    await redis.del(keys.socket(socketId));
    return;
  }

  if (socketId) {
    await redis
      .pipeline()
      .del(keys.user(userId))
      .del(keys.socket(socketId))
      .exec();
    logger.info(
      `[T8] deleted presence:user:${userId} and presence:socket:${socketId}`,
    );
  } else {
    await redis.del(keys.user(userId));
  }
}

export const presenceService = {
  setPresence,
  getSocketIdMap,
  getSocketIdList,
  getUserId,
  deletePresence,
} as const;
