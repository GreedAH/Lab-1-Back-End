import express, { Router } from "express";
import { validationResult } from "express-validator";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import {
  validateCreateUser,
  validateUpdateUser,
} from "../middleware/userValidation.js";

const router: Router = express.Router();

// Middleware to check validation results
const checkValidation = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Routes
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/", validateCreateUser, checkValidation, createUser);
router.put("/:id", validateUpdateUser, checkValidation, updateUser);
router.delete("/:id", deleteUser);

export { router };
