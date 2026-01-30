import { Socket } from "socket.io";
import { User } from "../../_mock/types";
import { db } from "../../_mock/db";

/**
 * Middleware that validates chat user socket connections,
 * checks for auth token in handshake,
 * decodes user data and binds socket.id to the corresponding mocked user
 */
export function chatMiddleware(socket: Socket, next: Function) {
  const { token } = socket.handshake.auth;

  if (!token) return next(new Error("Missing token"));

  const decoded: Omit<User, "password"> = JSON.parse(atob(token));

  const user = db.users.find((u) => u.id === decoded.id);
  if (user) user.socketId = socket.id;

  next();
}
