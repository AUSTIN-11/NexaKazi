import express from "express";
import { register, login } from "../controllers/authController.js";
import { validateFields } from "../middleware/validateInput.js";
import { authRateLimit } from "../middleware/rateLimit.js";

const router = express.Router();

router.post("/register", authRateLimit, validateFields(["name", "email", "password"]), register);
router.post("/login", authRateLimit, validateFields(["email", "password"]), login);

export default router;