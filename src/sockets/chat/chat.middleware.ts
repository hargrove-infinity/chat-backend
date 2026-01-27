import { Socket } from "socket.io";
import { mockedUsers, User } from "../../_mock";

/**
 * Middleware that validates chat user socket connections,
 * checks for auth token in handshake,
 * decodes user data and binds socket.id to the corresponding mocked user
 */
export function chatMiddleware(socket: Socket, next: Function) {
  const { token } = socket.handshake.auth;

  if (!token) return next(new Error("Missing token"));

  const decoded: Omit<User, "password"> = JSON.parse(atob(token));

  const user = mockedUsers.find((u) => u.id === decoded.id);
  if (user) user.socketId = socket.id;

  next();
}
