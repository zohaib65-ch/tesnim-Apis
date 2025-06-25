import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Generate a unique request ID
  const requestId = `req-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 15)}`;

  // Add request ID to response headers
  res.setHeader("X-Request-ID", requestId);

  // Log the request details
  logger.info({
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });

  // Track response time
  const start = Date.now();

  // Once the response is finished, log response details
  res.on("finish", () => {
    const responseTime = Date.now() - start;

    // Log based on status code
    const logMethod = res.statusCode >= 400 ? "warn" : "info";

    logger[logMethod]({
      requestId,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
    });
  });

  next();
};
