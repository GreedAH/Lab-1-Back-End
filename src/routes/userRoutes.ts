import express, { Router } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import {
  authenticateToken,
  requireRole,
} from "../middleware/authMiddleware.js";

const router: Router = express.Router();

// Protect all user routes with authentication
router.use(authenticateToken);

// Routes
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export { router };
