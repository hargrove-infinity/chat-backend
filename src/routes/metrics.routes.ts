import { type Request, type Response, Router } from "express";
import { paths } from "../common/paths";
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
  validate({ schema: logArraySchema }),
  async (req: Request<object, object, LogArrayInput>, res: Response) => {
    try {
      const { body } = req;

      await logRepository.create(body);

      res.send({ payload: {} });
    } catch (error) {
      // TODO: change later
      if (error instanceof Error) {
        res.status(500).send({ errors: [error.message] });
        return;
      }
      res.status(500).send({ errors: ["Unknown error"] });
    }
  },
);
