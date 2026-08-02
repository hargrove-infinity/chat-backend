import type { ExtendedError, Socket } from "socket.io";
import { auth } from "../../auth";
import { CHAT_NAMESPACE } from "../../common/socket";
import { logger } from "../../logger";
import { presenceService } from "../../services/presence.service";

/**
 * Middleware that validates chat user socket connections,
 * checks for auth token in handshake,
 * validates it against Better Auth's session store,
 * and binds socket.id to the corresponding user
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

  const session = await auth.api.getSession({
    headers: new Headers({ Authorization: `Bearer ${token}` }),
  });

  if (!session) {
    logger.error("Invalid or expired token in chat middleware");
    const err: ExtendedError = new Error("Unauthorized");
    err.data = { namespace: CHAT_NAMESPACE, source: "middleware" };
    return next(err);
  }

  const { user } = session;

  socket.data.user = user;

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

  next();
}
