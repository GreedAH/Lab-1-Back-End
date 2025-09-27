import { Router } from "express";
import { login, refreshToken, logout } from "../controllers/authController.js";
import { forgotPassword } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();

// Routes
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/logout", authenticateToken, logout);
router.post("/forgot-password/:id", forgotPassword);

export default router;
