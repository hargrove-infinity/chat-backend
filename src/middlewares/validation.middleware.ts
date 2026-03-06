import type { NextFunction, Request, Response } from "express";
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
      res.status(400).send({ errors: result.error.issues });
      return;
    }

    next();
  };
}
