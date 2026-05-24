import { redis } from "../redis";

async function setSocketId({
  userId,
  socketId,
}: {
  userId: string;
  socketId: string;
}) {
  await redis.hset(userId, { socketId });
}

async function getSocketId(userId: string) {
  return redis.hget(userId, "socketId");
}

async function deleteSocketId(userId: string) {
  await redis.hdel(userId, "socketId");
}

export const presenceService = {
  setSocketId,
  getSocketId,
  deleteSocketId,
} as const;
