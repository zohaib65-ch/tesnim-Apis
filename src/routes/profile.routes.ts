import { validate } from "../middleware/validator.middleware";
import { updateProfileSchema } from "../validations/auth.validators";
import express from "express";
import { updateProfile, getProfile } from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

// Protected routes (require authentication)
router.use(protect);
router.patch("/update-profile", validate(updateProfileSchema), updateProfile);
router.get("/me", getProfile);

export default router;
