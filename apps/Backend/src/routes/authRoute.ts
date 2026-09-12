import { Router } from "express";
import {
  loginController,
  refreshController,
} from "../controller/authController.js";
import { wrapAsync } from "../utils/wrapAsync.js";
import { validate } from "../middleware/validateMiddleware.js";
import { loginSchema } from "../validators/authValidator.js";

const router = Router();

router.post(
  "/login",
  validate(loginSchema),
  wrapAsync(loginController)
);

router.post(
  "/refresh",
  wrapAsync(refreshController)
);

export default router;