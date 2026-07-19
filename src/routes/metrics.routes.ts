import { type Request, type Response, Router } from "express";
import { paths } from "../common/paths";
import { logger } from "../logger";
import { authMiddleware } from "../middlewares/auth.middleware";
import { parsePlainTextJson } from "../middlewares/parse-plain-text-json.middleware";
import { validate } from "../middlewares/validation.middleware";
import { logRepository } from "../repositories/log.repository";
import {
  type MetricsPayloadInput,
  metricsPayloadSchema,
} from "../validation/metrics";

export const metricsRouter = Router();

type MetricsLocals = {
  body: MetricsPayloadInput;
};

/**
 * Receives an array of error logs from the client
 */
metricsRouter.post(
  paths.metrics.logs,
  // Parse text/plain body to JSON before validation (sendBeacon uses text/plain to avoid CORS preflight)
  parsePlainTextJson,
  authMiddleware("body"),
  validate({ schema: metricsPayloadSchema }),
  async (_req: Request, res: Response<unknown, MetricsLocals>) => {
    const { body } = res.locals;

    const [, error] = await logRepository.create(body.logs);

    if (error) {
      logger.error("Failed to save logs in POST /metrics/logs");

      res.status(500).send({ errors: ["Unknown error"] });
      return;
    }

    res.send({ payload: {} });
  },
);
