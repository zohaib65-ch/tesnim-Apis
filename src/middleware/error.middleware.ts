import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { AppError } from "../utils/appError";
import config from "../config";

export const errorMiddleware = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(`${err.name || "Error"}: ${err.message}`);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = new AppError(message, 404);
  }

  // Mongoose duplicate key
  if (err.name === "MongoServerError" && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    const message = `Duplicate field value: ${field}. Please use another value`;
    error = new AppError(message, 400);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values((err as any).errors)
      .map((val: any) => val.message)
      .join(", ");
    error = new AppError(message, 400);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token. Please log in again.";
    error = new AppError(message, 401);
  }

  if (err.name === "TokenExpiredError") {
    const message = "Your token has expired. Please log in again.";
    error = new AppError(message, 401);
  }

  // Send response
  res.status((error as AppError).statusCode || 500).json({
    success: false,
    error: (error as AppError).message || "Server Error",
    ...(config.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};
