import type { NextFunction, Request, Response } from "express";
import { logger } from "../logger";
import type {
  ValidateArgs,
  ValidateReturn,
} from "./validation.middleware.types";

export function validate<T>({
  schema,
  key = "body",
}: ValidateArgs): ValidateReturn<T> {
  return (req: Request<T>, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[key]);

    if (!result.success) {
      logger.error({ error: result.error.issues }, "Validation failed");
      res.status(400).send({ errors: result.error.issues });
      return;
    }

    req[key] = result.data;

    next();
  };
}
