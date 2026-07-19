import { z } from "zod";

const stringifiedNumberSchema = z
  .string()
  .regex(/^\d+$/, "Must be a stringified number");

export const queryParamsUsersSearchSchema = z.object({
  text: z.string().trim().min(1),
  page: stringifiedNumberSchema,
  size: stringifiedNumberSchema,
});

export type QueryParamsUsersSearchInput = z.infer<
  typeof queryParamsUsersSearchSchema
>;
