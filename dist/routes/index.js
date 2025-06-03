import { Router } from "express";
import { router as userRoutes } from "./userRoutes.js";
import authRoutes from "./authRoutes.js";
const router = Router();
// Mount routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
// Add future routes here
// router.use("/festivals", festivalRoutes);
// router.use("/concerts", concertRoutes);
export { router };
//# sourceMappingURL=index.js.map