import express, { Router } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  findUserByEmail,
} from "../controllers/userController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router: Router = express.Router();

// Protect all user routes with authentication
router.post("/", createUser);
// Find user by email
router.post("/find-by-email", findUserByEmail);

// Protected routes
router.get("/", authenticateToken, getAllUsers);
router.get("/:id", authenticateToken, getUserById);
router.put("/:id", authenticateToken, updateUser);
router.delete("/:id", authenticateToken, deleteUser);

export { router };
