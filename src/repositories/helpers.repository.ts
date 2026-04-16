import {
  and,
  type Column,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  like,
  lt,
  lte,
  type SQL,
} from "drizzle-orm";

type FilterValue<T> =
  | T
  | {
      eq?: T;
      lt?: T;
      lte?: T;
      gt?: T;
      gte?: T;
      like?: T;
      ilike?: T;
      in?: T[];
    };

export type Filters<TColumns extends Record<string, Column>> = {
  [K in keyof TColumns]?: FilterValue<TColumns[K]["_"]["data"]>;
};

// TODO: find better name
export function buildConditions<TColumns extends Record<string, Column>>(
  columns: TColumns,
  filters?: Filters<TColumns>,
): SQL | undefined {
  if (!filters) return undefined;

  const conditions: SQL[] = [];

  for (const [key, value] of Object.entries(filters)) {
    const column = columns[key];

    if (!column) continue;

    if (value === null || typeof value !== "object") {
      conditions.push(eq(column, value));
      continue;
    }

    if (value.eq !== undefined) conditions.push(eq(column, value.eq));
    if (value.lt !== undefined) conditions.push(lt(column, value.lt));
    if (value.lte !== undefined) conditions.push(lte(column, value.lte));
    if (value.gt !== undefined) conditions.push(gt(column, value.gt));
    if (value.gte !== undefined) conditions.push(gte(column, value.gte));
    if (value.like !== undefined) conditions.push(like(column, value.like));
    if (value.ilike !== undefined) conditions.push(ilike(column, value.ilike));
    if (value.in !== undefined) conditions.push(inArray(column, value.in));
  }

  return conditions.length ? and(...conditions) : undefined;
}
