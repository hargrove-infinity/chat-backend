import { redis } from "../redis";

async function setPresence({
  userId,
  socketId,
}: {
  userId: string;
  socketId: string;
}) {
  await redis.hset(userId, { socketId });
  await redis.hset(socketId, { userId });
}

async function getSocketIds(userIds: string[]) {
  if (userIds.length === 0) return [];

  const pipeline = redis.pipeline();

  for (const userId of userIds) {
    pipeline.hget(userId, "socketId");
  }

  const results = await pipeline.exec();

  return (results ?? []).map(([error, value]) => {
    if (error !== null) {
      return null;
    }

    if (typeof value === "string") {
      return value;
    }

    return null;
  });
}

async function getUserId(socketId: string) {
  return await redis.hget(socketId, "userId");
}

async function deletePresence(userId: string) {
  const socketId = await redis.hget(userId, "socketId");
  await redis.hdel(userId, "socketId");
  if (socketId) {
    await redis.hdel(socketId, "userId");
  }
}

export const presenceService = {
  setPresence,
  getSocketIds,
  getUserId,
  deletePresence,
} as const;
