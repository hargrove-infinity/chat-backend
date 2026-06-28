import type { ExtendedError, Socket } from "socket.io";
import { CHAT_NAMESPACE } from "../../common/socket";
import type { UserSelect } from "../../db/types";
import { logger } from "../../logger";
import { userRepository } from "../../repositories/user.repository";
import { presenceService } from "../../services/presence.service";

/**
 * Middleware that validates chat user socket connections,
 * checks for auth token in handshake,
 * decodes user data and binds socket.id to the corresponding mocked user
 */
export async function chatMiddleware(
  socket: Socket,
  next: (err?: ExtendedError) => void,
) {
  const { token } = socket.handshake.auth;

  if (!token) {
    logger.error("No token provided in chat middleware");
    const err: ExtendedError = new Error("Missing token");
    err.data = { namespace: CHAT_NAMESPACE, source: "middleware" };
    return next(err);
  }

  const decoded: Omit<UserSelect, "password"> = JSON.parse(atob(token));

  const [user, userError] = await userRepository.findFirstBy({
    id: decoded.id,
  });

  if (userError) {
    logger.error(
      { error: userError },
      "Failed to find user in chat middleware",
    );
    const err: ExtendedError = new Error("Unknown error");
    err.data = { namespace: CHAT_NAMESPACE, source: "middleware" };
    return next(err);
  }

  if (user) {
    const [, setPresenceError] = await presenceService.setPresence({
      userId: user.id,
      socketId: socket.id,
    });

    if (setPresenceError) {
      logger.error(
        { error: setPresenceError },
        "Failed to set presence in Redis in chat middleware",
      );

      const err: ExtendedError = new Error("Failed to set presence");
      err.data = { namespace: CHAT_NAMESPACE, source: "middleware" };
      return next(err);
    }
  }

  next();
}
