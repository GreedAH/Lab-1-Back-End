import express, { Router } from "express";
import {
  createReservation,
  cancelReservation,
  getReservationsByUserId,
  getReservationsByEventId,
} from "../controllers/reservationController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router: Router = express.Router();

// Protect all reservation routes with authentication
router.use(authenticateToken);

// Routes
router.post("/", createReservation);
router.put("/:id/cancel", cancelReservation);
router.get("/user/:userId", getReservationsByUserId);
router.get("/event/:eventId", getReservationsByEventId);

export { router };
