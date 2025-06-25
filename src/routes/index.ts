import express from "express";
import auth from "./auth.routes";
import profile from "./profile.routes";
import todos from "./todo.routes";

const router = express.Router();

router.use("/auth", auth);

router.use("/profile", profile);
router.use("/todos", todos);

export default router;
