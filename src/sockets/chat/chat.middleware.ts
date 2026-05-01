import type { ExtendedError, Socket } from "socket.io";
import { db } from "../../_mock/db";
import type { User } from "../../_mock/types";
import { CHAT_NAMESPACE } from "../../common/socket";
import { userRepository } from "../../repositories/user.repository";

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
    const err: ExtendedError = new Error("Missing token");
    err.data = { namespace: CHAT_NAMESPACE, source: "middleware" };
    return next(err);
  }

  const decoded: Omit<User, "password"> = JSON.parse(atob(token));

  const user = db.users.find((u) => u.id === decoded.id);

  if (user) {
    // TODO: set socketId = socket.id in database
    user.socketId = socket.id;

    await userRepository.updateBy({
      where: { id: user.id },
      set: { socketId: socket.id },
    });
  }

  next();
}
