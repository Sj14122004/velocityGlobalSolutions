import { Router } from "express";
import {
  createProjectManagerController,
  getProjectManagersController,
  getProjectManagerByIdController,
  updateProjectManagerController,
  deleteProjectManagerController,
} from "../controller/projectManagerController.js";
import { wrapAsync } from "../utils/wrapAsync.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import {
  createProjectManagerSchema,
  getProjectManagerByIdSchema,
  updateProjectManagerSchema,
  deleteProjectManagerSchema,
} from "../validators/projectManagerValidator.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createProjectManagerSchema),
  wrapAsync(createProjectManagerController)
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  wrapAsync(getProjectManagersController)
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(getProjectManagerByIdSchema),
  wrapAsync(getProjectManagerByIdController)
);

router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updateProjectManagerSchema),
  wrapAsync(updateProjectManagerController)
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(deleteProjectManagerSchema),
  wrapAsync(deleteProjectManagerController)
);

export default router;