import { type Request, type Response, Router } from "express";
// TODO: replace crypto.randomUUID
import { v4 as uuidv4 } from "uuid";
import { db } from "../_mock/db";
import { paths } from "../common/paths";
import { parsePlainTextJson } from "../middlewares/parse-plain-text-json.middleware";
import { validate } from "../middlewares/validation.middleware";
import { type LogArrayInput, logArraySchema } from "../validation/metrics";

export const metricsRouter = Router();

/**
 * Receives an array of error logs from the client
 */
metricsRouter.post(
  paths.metrics.logs,
  // Parse text/plain body to JSON before validation (sendBeacon uses text/plain to avoid CORS preflight)
  parsePlainTextJson,
  validate({ schema: logArraySchema }),
  async (req: Request<object, object, LogArrayInput>, res: Response) => {
    const { body } = req;

    const logsWithIds = body.map((log) => ({ ...log, id: uuidv4() }));

    db.logs = [...db.logs, ...logsWithIds];

    res.send({ payload: {} });
  },
);
