import { Router } from "express";
import { router as userRoutes } from "./userRoutes.js";
import { router as eventRoutes } from "./eventRoutes.js";
import { router as reservationRoutes } from "./reservationRoutes.js";
import { router as reviewRoutes } from "./reviewRoutes.js";
import authRoutes from "./authRoutes.js";

const router = Router();

// Mount routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/events", eventRoutes);
router.use("/reservations", reservationRoutes);
router.use("/reviews", reviewRoutes);

export { router };
