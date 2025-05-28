import { Router } from "express";
import { router as userRoutes } from "./userRoutes.js";

const router = Router();

// Mount routes
router.use("/users", userRoutes);

// Add future routes here
// router.use("/festivals", festivalRoutes);
// router.use("/concerts", concertRoutes);

export { router };
