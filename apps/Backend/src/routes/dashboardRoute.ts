import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { wrapAsync } from "../utils/wrapAsync.js";
import { getDashboardController } from "../controller/dashboardController.js";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "PROJECT_MANAGER", "DEVELOPER"),
  wrapAsync(getDashboardController)
);

export default router;