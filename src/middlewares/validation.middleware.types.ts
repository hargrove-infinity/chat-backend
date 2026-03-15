import type { NextFunction, Request, Response } from "express";
import type { ZodArray, ZodObject } from "zod";

export type ValidateArgs = {
  schema: ZodObject | ZodArray<ZodObject>;
  key?: "params" | "body" | "query";
};

export type ValidateReturn<T> = (
  req: Request<T>,
  res: Response,
  next: NextFunction,
) => void;
