import { Router } from "express";
import { getActivitiesController } from "../controller/activityController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { wrapAsync } from "../utils/wrapAsync.js";
import { validate } from "../middleware/validateMiddleware.js";
import { getActivitiesSchema } from "../validators/activityValidator.js";

const router = Router();

router.get(
  "/",
  authenticate,
  validate(getActivitiesSchema),
  wrapAsync(getActivitiesController)
);

export default router;