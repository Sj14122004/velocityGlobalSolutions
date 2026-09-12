import { Router } from "express";
import {
  createProjectController,
  getProjectsController,
  getProjectByIdController,
  updateProjectController,
  deleteProjectController,
} from "../controller/projectController.js";
import { wrapAsync } from "../utils/wrapAsync.js";
import { validate } from "../middleware/validateMiddleware.js";
import {
  createProjectSchema,
  getProjectByIdSchema,
  updateProjectSchema,
  deleteProjectSchema,
} from "../validators/projectValidator.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "PROJECT_MANAGER"),
  validate(createProjectSchema),
  wrapAsync(createProjectController)
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "PROJECT_MANAGER", "DEVELOPER"),
  wrapAsync(getProjectsController)
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "PROJECT_MANAGER", "DEVELOPER"),
  validate(getProjectByIdSchema),
  wrapAsync(getProjectByIdController)
);

router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN", "PROJECT_MANAGER"),
  validate(updateProjectSchema),
  wrapAsync(updateProjectController)
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "PROJECT_MANAGER"),
  validate(deleteProjectSchema),
  wrapAsync(deleteProjectController)
);

export default router;