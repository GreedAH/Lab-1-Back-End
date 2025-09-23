import express, { Router } from "express";
import {
  getAllEvents,
  getAllEventsSortedByStatus,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";
import {
  authenticateToken,
  requireRole,
} from "../middleware/authMiddleware.js";

const router: Router = express.Router();

// Public route for getting events sorted by status (open first)
router.get("/public/sorted", getAllEventsSortedByStatus);

// Protect all other event routes with authentication
router.use(authenticateToken);

// Routes
router.get("/", getAllEvents);
router.get("/:id", getEventById);
router.post("/", requireRole(["ADMIN", "SUPER_ADMIN"]), createEvent);
router.put("/:id", requireRole(["ADMIN", "SUPER_ADMIN"]), updateEvent);
router.delete("/:id", requireRole(["ADMIN", "SUPER_ADMIN"]), deleteEvent);

export { router };
