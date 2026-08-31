import { logger } from "../logger";
import { redis } from "../redis";
import { asyncTryCatch } from "../util/asyncTryCatch";

const SIGN_UP_ATTEMPT_EMAIL_TTL_SECONDS = 15 * 60;

const keys = {
  authSignUpAttemptEmail: (userId: string) =>
    `auth:sign-up-attempt-email:${userId}`,
};

/**
 * Attempts to acquire a per-user lock before sending a sign-up-attempt email.
 * Returns "OK" only on the first call within the TTL window; subsequent
 * calls return null until the key expires, preventing duplicate sends.
 */
async function trySetSignUpAttemptEmailLock(
  userId: string,
): Promise<["OK" | null, null] | [null, Error]> {
  const [lockAcquired, lockAcquiredError] = await asyncTryCatch(
    redis.set(
      keys.authSignUpAttemptEmail(userId),
      "1",
      "EX",
      SIGN_UP_ATTEMPT_EMAIL_TTL_SECONDS,
      "NX",
    ),
  );

  if (lockAcquiredError) {
    logger.error(
      { error: lockAcquiredError },
      "Redis error while setting sign-up attempt email lock for user",
    );

    return [null, lockAcquiredError] as const;
  }

  return [lockAcquired, null];
}

export const redisService = {
  trySetSignUpAttemptEmailLock,
} as const;
