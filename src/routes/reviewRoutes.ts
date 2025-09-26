import express, { Router } from "express";
import { createReview, deleteReview } from "../controllers/reviewController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router: Router = express.Router();

// Protect all review routes
router.use(authenticateToken);

// Create a review
router.post("/", createReview);

// Soft-delete a review
router.delete("/:id", deleteReview);

export { router };
