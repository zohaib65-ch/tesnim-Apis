import winston from "winston";
import config from "../config";

const { combine, timestamp, printf, colorize, errors } = winston.format;

const customFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  let formattedMessage = `[${timestamp}] [${level}] : ${stack || message}`;

  if (Object.keys(meta).length) {
    formattedMessage += ` | meta: ${JSON.stringify(meta)}`;
  }

  return formattedMessage;
});

export const logger = winston.createLogger({
  level: config.LOG_LEVEL || "info",
  format: combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    config.NODE_ENV === "development"
      ? colorize()
      : winston.format.uncolorize(),
    customFormat
  ),
  defaultMeta: { service: "minest-api" },
  transports: [
    new winston.transports.Console(),

    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: "logs/exceptions.log" }),
  ],
});
