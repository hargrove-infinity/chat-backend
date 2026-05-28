import { redis } from "../redis";

const keys = {
  user: (userId: string) => `presence:user:${userId}`,
  socket: (socketId: string) => `presence:socket:${socketId}`,
};

type SetPresenceArgs = { userId: string; socketId: string };

async function setPresence(args: SetPresenceArgs): Promise<void> {
  const { socketId, userId } = args;

  await redis
    .pipeline()
    .set(keys.user(userId), socketId)
    .set(keys.socket(socketId), userId)
    .exec();
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

async function deletePresence(userId: string): Promise<void> {
  const socketId = await redis.get(keys.user(userId));

  if (socketId) {
    await redis
      .pipeline()
      .del(keys.user(userId))
      .del(keys.socket(socketId))
      .exec();
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
