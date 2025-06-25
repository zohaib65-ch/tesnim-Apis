import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { AppError } from "../utils/appError";

export const validate =
  (schema: Joi.Schema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const validationOptions = {
      abortEarly: false, // Return all errors
      allowUnknown: true, // Ignore unknown props
      stripUnknown: true, // Remove unknown props
    };

    const { error, value } = schema.validate(req.body, validationOptions);

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");

      return next(new AppError(errorMessage, 400));
    }

    // Update req.body with validated data
    req.body = value;
    return next();
  };
