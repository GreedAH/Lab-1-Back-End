import { Router } from "express";
import { router as userRoutes } from "./userRoutes.js";
import { router as eventRoutes } from "./eventRoutes.js";
import authRoutes from "./authRoutes.js";

const router = Router();

// Mount routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/events", eventRoutes);

export { router };
