import Joi from "joi";

export const registerSchema = Joi.object({
  email: Joi.string().email().required().trim(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().min(2).max(50).required().trim(),
  lastName: Joi.string().min(2).max(50).required().trim(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().trim(),
  password: Joi.string().required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().trim(),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).required(),
});

export const verifyEmailSchema = Joi.object({
  token: Joi.string().required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .required()
    .disallow(Joi.ref("currentPassword"))
    .messages({
      "any.invalid": "New password must be different from the current password",
    }),
});

export const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).trim(),
  lastName: Joi.string().min(2).max(50).trim(),
  email: Joi.string().email().trim(),
}).min(1);
