import pino from "pino";

export const logger = pino({
  serializers: {
    error: pino.stdSerializers.err,
  },
  transport: {
    target: "pino-pretty",
    options: {
      translateTime: "yyyy-mm-dd HH:MM:ss.l",
    },
  },
});
