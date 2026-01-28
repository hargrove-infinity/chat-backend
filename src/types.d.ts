import type { Request } from "express";
import { User } from './_mock'

declare global {
  namespace Express {
    interface Request {
      user?: Omit<User, "password">;
    }
  }
}
