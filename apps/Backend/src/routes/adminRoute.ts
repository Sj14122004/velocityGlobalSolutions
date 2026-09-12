import { Router } from "express";
import {
  createAdminController,
  getAdminsController,
  getAdminByIdController,
  updateAdminController,
  deleteAdminController,
} from "../controller/adminController.js";
import { wrapAsync } from "../utils/wrapAsync.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import {
  createAdminSchema,
  getAdminByIdSchema,
  updateAdminSchema,
  deleteAdminSchema,
} from "../validators/adminValidator.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createAdminSchema),
  wrapAsync(createAdminController)
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN"),
  wrapAsync(getAdminsController)
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(getAdminByIdSchema),
  wrapAsync(getAdminByIdController)
);

router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(updateAdminSchema),
  wrapAsync(updateAdminController)
);

router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(deleteAdminSchema),
  wrapAsync(deleteAdminController)
);

export default router;