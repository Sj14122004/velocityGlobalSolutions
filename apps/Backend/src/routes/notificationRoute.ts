import { Router } from "express";

import {
  getNotificationsController,
  getUnreadNotificationCountController,
  markNotificationAsReadController,
  markAllNotificationsAsReadController,
} from "../controller/notificationController.js";

import { authenticate } from "../middleware/authMiddleware.js";
import { wrapAsync } from "../utils/wrapAsync.js";
import { validate } from "../middleware/validateMiddleware.js";

import {
  markNotificationAsReadSchema,
} from "../validators/notificationValidator.js";

const router = Router();

router.get(
  "/",
  authenticate,
  wrapAsync(getNotificationsController)
);

router.get(
  "/unread-count",
  authenticate,
  wrapAsync(getUnreadNotificationCountController)
);

router.patch(
  "/:id/read",
  authenticate,
  validate(markNotificationAsReadSchema),
  wrapAsync(markNotificationAsReadController)
);

router.patch(
  "/read-all",
  authenticate,
  wrapAsync(markAllNotificationsAsReadController)
);

export default router;