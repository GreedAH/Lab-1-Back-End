import { Router } from "express";
import { login, refreshToken, logout } from "../controllers/authController.js";
import { body } from "express-validator";
import { authenticateToken } from "../middleware/authMiddleware.js";
const router = Router();
// Validation middleware
const loginValidation = [
    body("email").isEmail().normalizeEmail().withMessage("Invalid email address"),
    body("password").notEmpty().withMessage("Password is required"),
];
// Routes
router.post("/login", loginValidation, login);
router.post("/refresh-token", refreshToken);
router.post("/logout", authenticateToken, logout);
export default router;
//# sourceMappingURL=authRoutes.js.map