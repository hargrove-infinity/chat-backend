import { type Request, type Response, Router } from "express";
import { paths } from "../common/paths";
import { logger } from "../logger";
import { authMiddleware } from "../middlewares/auth.middleware";
import { extractLogsBody } from "../middlewares/extract-logs-body.middleware";
import { parsePlainTextJson } from "../middlewares/parse-plain-text-json.middleware";
import { validate } from "../middlewares/validation.middleware";
import { logRepository } from "../repositories/log.repository";
import { type LogArrayInput, logArraySchema } from "../validation/metrics";

export const metricsRouter = Router();

/**
 * Receives an array of error logs from the client
 */
metricsRouter.post(
  paths.metrics.logs,
  // Parse text/plain body to JSON before validation (sendBeacon uses text/plain to avoid CORS preflight)
  parsePlainTextJson,
  // Authenticate using token from parsed body
  authMiddleware("body"),
  // Unwrap req.body.logs array for validation
  extractLogsBody,
  // Validate that body is an array of well-formed log objects
  validate({ schema: logArraySchema }),
  async (req: Request<object, object, LogArrayInput>, res: Response) => {
    const { body } = req;

    const [, error] = await logRepository.create(body);

    if (error) {
      logger.error("Failed to save logs in POST /metrics/logs");

      res.status(500).send({ errors: ["Unknown error"] });
      return;
    }

    res.send({ payload: {} });
  },
);
