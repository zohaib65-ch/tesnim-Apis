import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import { User } from "../models/user.model";
import { logger } from "../utils/logger";
import { AppError } from "../utils/appError";

export interface TokenPayload {
  id: string;
  iat: number;
  exp: number;
}

// Extend Express Request interface to include the user object
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check for token in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Make sure token exists
    if (!token) {
      return next(new AppError("Not authorized to access this route", 401));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, config.JWT_SECRET) as TokenPayload;

      // Get user from database
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new AppError("User not found", 404));
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error: any) {
      logger.error(`JWT Verification Error: ${error.message}`);
      return next(
        new AppError("Not authorized, token invalid or expired", 401)
      );
    }
  } catch (error: any) {
    logger.error(`Auth Middleware Error: ${error.message}`);
    return next(new AppError("Authentication error", 500));
  }
};

// Middleware to restrict access to certain roles
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Role (${req.user?.role}) is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// Middleware to restrict access to premium users only
export const premiumOnly = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.plan !== "premium") {
    return next(
      new AppError("This feature is only available to premium users", 403)
    );
  }
  next();
};
