import type { User } from "./_mock/types";

declare global {
  namespace Express {
    interface Request {
      user?: Omit<User, "password">;
    }
  }
}
