import type { UserSelect } from "./db/schema";

declare global {
  namespace Express {
    interface Request {
      user?: Omit<UserSelect, "password">;
    }
  }
}
