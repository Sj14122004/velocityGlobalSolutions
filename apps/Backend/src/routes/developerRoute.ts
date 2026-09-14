import { Router } from "express";
import {
  createDeveloperController,
  getDevelopersController,
  getDeveloperByIdController,
  updateDeveloperController,
  deleteDeveloperController,
} from "../controller/developerController.js";
import { wrapAsync } from "../utils/wrapAsync.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import {
  createDeveloperSchema,
  getDeveloperByIdSchema,
  updateDeveloperSchema,
  deleteDeveloperSchema,
} from "../validators/developerValidator.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createDeveloperSchema),
  wrapAsync(createDeveloperController)
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "PROJECT_MANAGER"),
  wrapAsync(getDevelopersController)
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(getDeveloperByIdSchema),
  wrapAsync(getDeveloperByIdController)
);

router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updateDeveloperSchema),
  wrapAsync(updateDeveloperController)
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(deleteDeveloperSchema),
  wrapAsync(deleteDeveloperController)
);

export default router;