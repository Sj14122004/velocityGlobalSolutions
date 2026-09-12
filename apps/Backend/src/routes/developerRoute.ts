import { Router } from "express";
import {
  createDeveloperController,
  getDevelopersController,
  getDeveloperByIdController,
} from "../controller/developerController.js";
import { wrapAsync } from "../utils/wrapAsync.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import {
  createDeveloperSchema,
  getDeveloperByIdSchema,
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
  authorize("ADMIN"),
  wrapAsync(getDevelopersController)
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(getDeveloperByIdSchema),
  wrapAsync(getDeveloperByIdController)
);

export default router;