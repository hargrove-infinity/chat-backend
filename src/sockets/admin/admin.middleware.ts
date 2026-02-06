import type { ExtendedError, Socket } from "socket.io";

/**
 * Middleware that restricts admin namespace access,
 * ensures the connecting socket belongs to an admin user
 * and validates presence of an auth token
 */
export function adminMiddleware(
  socket: Socket,
  next: (err?: ExtendedError) => void,
) {
  const { isAdmin, token } = socket.handshake.auth;

  if (!isAdmin) {
    return next(new Error("Missing admin role"));
  }

  if (!token) {
    return next(new Error("Missing admin token"));
  }

  console.log("Admin with token has been accepted");
  next();
}
