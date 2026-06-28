import { logger } from "../logger";
import { redis } from "../redis";
import { asyncTryCatch } from "../util/asyncTryCatch";

const keys = {
  userToSocket: (userId: string) => `presence:user:${userId}:socketId`,
  socketToUser: (socketId: string) => `presence:socket:${socketId}:userId`,
};

type HandlePresenceArgs = { userId: string; socketId: string };

/**
 * Stores bidirectional mapping between userId and socketId in Redis.
 */
async function setPresence(
  args: HandlePresenceArgs,
): Promise<[null, null] | [null, Error]> {
  const { socketId, userId } = args;

  const [previousSocketId, previousSocketIdError] = await asyncTryCatch(
    redis.get(keys.userToSocket(userId)),
  );

  if (previousSocketIdError) {
    logger.error(
      { error: previousSocketIdError },
      "Redis error while fetching previous socket ID for user",
    );

    return [null, previousSocketIdError] as const;
  }

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

  const [, error] = await asyncTryCatch(pipeline.exec());

  if (error) {
    logger.error(
      { error },
      "Redis error while executing presence pipeline for user",
    );

    return [null, error] as const;
  }

  return [null, null];
}

async function getUserId(
  socketId: string,
): Promise<[string | null, null] | [null, Error]> {
  const [userId, error] = await asyncTryCatch(
    redis.get(keys.socketToUser(socketId)),
  );

  if (error) {
    logger.error({ error }, "Redis error while fetching userId by socket ID");

    return [null, error] as const;
  }

  return [userId, null];
}

/**
 * Returns only online users as { userId → socketId }.
 * Offline users are simply absent from the map.
 */
async function getUserSocketMap(
  userIds: string[],
): Promise<[Record<string, string>, null] | [null, Error]> {
  if (userIds.length === 0) return [{}, null];

  const pipeline = redis.pipeline();

  for (const userId of userIds) {
    pipeline.get(keys.userToSocket(userId));
  }

  const [rawResults, error] = await asyncTryCatch(pipeline.exec());

  if (error) {
    logger.error({ error }, "Redis error while fetching socket IDs for users");

    return [null, error] as const;
  }

  const results = rawResults ?? [];

  const userSocketIdMap: Record<string, string> = {};

  results.forEach(([error, value], i) => {
    const userId = userIds[i];
    if (!userId) return;
    if (!error && typeof value === "string") {
      userSocketIdMap[userId] = value;
    }
  });

  return [userSocketIdMap, null];
}

/**
 * Returns socket IDs of online users only, offline users are excluded.
 */
async function getSocketIdList(
  userIds: string[],
): Promise<[string[], null] | [null, Error]> {
  if (userIds.length === 0) return [[], null];

  const pipeline = redis.pipeline();

  for (const userId of userIds) {
    pipeline.get(keys.userToSocket(userId));
  }

  const [rawResults, error] = await asyncTryCatch(pipeline.exec());

  if (error) {
    logger.error(
      { error },
      "Redis error while fetching socket ID list for users",
    );

    return [null, error] as const;
  }

  const results = rawResults ?? [];

  const socketIds = results.reduce<string[]>((acc, [error, value]) => {
    if (!error && typeof value === "string") {
      acc.push(value);
    }
    return acc;
  }, []);

  return [socketIds, null];
}

/**
 * Removes bidirectional mapping between userId and socketId in Redis.
 */
async function deletePresence(
  args: HandlePresenceArgs,
): Promise<[null, null] | [null, Error]> {
  const { socketId, userId } = args;

  /**
   * Due to delays (Redis latency, event loop lag, etc.), a new socket id may
   * have already been written to Redis by the time this cleanup runs.
   * When that happens, the socket id stored in Redis no longer matches
   * the disconnecting socket id (`socketId` arg) — meaning a newer connection
   * has taken over. Only delete the stale `socketId` — leave the new one untouched.
   */
  const [currentSocketId, currentSocketIdError] = await asyncTryCatch(
    redis.get(keys.userToSocket(userId)),
  );

  if (currentSocketIdError) {
    logger.error(
      { error: currentSocketIdError },
      "Redis error while fetching current socket ID for user",
    );

    return [null, currentSocketIdError] as const;
  }

  if (currentSocketId !== socketId) {
    const [, staleSocketDeleteError] = await asyncTryCatch(
      redis.del(keys.socketToUser(socketId)),
    );

    if (staleSocketDeleteError) {
      logger.error(
        { error: staleSocketDeleteError },
        "Redis error while deleting stale socket ID for user",
      );

      return [null, staleSocketDeleteError] as const;
    }

    return [null, null];
  }

  const [, presenceKeysDeleteError] = await asyncTryCatch(
    redis
      .pipeline()
      .del(keys.userToSocket(userId))
      .del(keys.socketToUser(socketId))
      .exec(),
  );

  if (presenceKeysDeleteError) {
    logger.error(
      { error: presenceKeysDeleteError },
      "Redis error while deleting presence keys for user",
    );

    return [null, presenceKeysDeleteError] as const;
  }

  return [null, null];
}

export const presenceService = {
  setPresence,
  getUserSocketMap,
  getSocketIdList,
  getUserId,
  deletePresence,
} as const;
