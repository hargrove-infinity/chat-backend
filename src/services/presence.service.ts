import { redis } from "../redis";

const keys = {
  userToSocket: (userId: string) => `presence:user:${userId}:socketId`,
  socketToUser: (socketId: string) => `presence:socket:${socketId}:userId`,
};

type HandlePresenceArgs = { userId: string; socketId: string };

/**
 * Stores bidirectional mapping between userId and socketId in Redis.
 */
async function setPresence(args: HandlePresenceArgs): Promise<void> {
  const { socketId, userId } = args;

  const previousSocketId = await redis.get(keys.userToSocket(userId));

  const pipeline = redis.pipeline();

  // On server restart or reconnect, the client gets a new socket ID.
  // The old socketToUser key is never cleaned up (no disconnect event fires
  // when the server crashes), so we delete it here before writing the new one.
  if (previousSocketId && previousSocketId !== socketId) {
    pipeline.del(keys.socketToUser(previousSocketId));
  }

  pipeline
    .set(keys.userToSocket(userId), socketId)
    .set(keys.socketToUser(socketId), userId);

  await pipeline.exec();
}

async function getUserId(socketId: string): Promise<string | null> {
  return await redis.get(keys.socketToUser(socketId));
}

/**
 * Returns only online users as { userId → socketId }.
 * Offline users are simply absent from the map.
 */
async function getUserSocketMap(
  userIds: string[],
): Promise<Record<string, string>> {
  if (userIds.length === 0) return {};

  const pipeline = redis.pipeline();

  for (const userId of userIds) {
    pipeline.get(keys.userToSocket(userId));
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
    pipeline.get(keys.userToSocket(userId));
  }

  const results = (await pipeline.exec()) ?? [];

  return results.reduce<string[]>((acc, [error, value]) => {
    if (!error && typeof value === "string") {
      acc.push(value);
    }
    return acc;
  }, []);
}

/**
 * Removes bidirectional mapping between userId and socketId in Redis.
 */
async function deletePresence(args: HandlePresenceArgs): Promise<void> {
  const { socketId, userId } = args;

  /**
   * Due to delays (Redis latency, event loop lag, etc.), a new socket id may
   * have already been written to Redis by the time this cleanup runs.
   * When that happens, the socket id stored in Redis no longer matches
   * the disconnecting socket id (`socketId` arg) — meaning a newer connection
   * has taken over. Only delete the stale `socketId` — leave the new one untouched.
   */
  const currentSocketId = await redis.get(keys.userToSocket(userId));

  if (currentSocketId !== socketId) {
    await redis.del(keys.socketToUser(socketId));
    return;
  }

  await redis
    .pipeline()
    .del(keys.userToSocket(userId))
    .del(keys.socketToUser(socketId))
    .exec();
}

export const presenceService = {
  setPresence,
  getUserSocketMap,
  getSocketIdList,
  getUserId,
  deletePresence,
} as const;
