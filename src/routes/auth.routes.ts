import express from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  changePassword,
} from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";
import { validate } from "../middleware/validator.middleware";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  changePasswordSchema,
} from "../validations/auth.validators";

const router = express.Router();

// Public routes
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh-token", validate(refreshTokenSchema), refreshToken);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.post("/verify-email", validate(verifyEmailSchema), verifyEmail);

// Protected routes
router.use(protect);

router.post("/logout", logout);
router.post("/change-password", validate(changePasswordSchema), changePassword);

export default router;
