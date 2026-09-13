import { Router } from "express";
import type { Server } from "socket.io";
import {
  createTaskController,
  getTasksController,
  getTaskByIdController,
  updateTaskController,
  deleteTaskController,
} from "../controller/taskController.js";
import { updateTaskStatusController } from "../controller/taskStatusController.js";
import {
  createTaskSchema,
  getTasksSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  getTaskByIdSchema,
  deleteTaskSchema,
} from "../validators/taskValidator.js";
import { validate } from "../middleware/validateMiddleware.js";
import { wrapAsync } from "../utils/wrapAsync.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

export const createTaskRoutes = (io: Server) => {
  const router = Router();

  router.post(
    "/",
    authenticate,
    authorize("ADMIN", "PROJECT_MANAGER"),
    validate(createTaskSchema),
    wrapAsync(createTaskController(io))
  );

  router.get(
    "/",
    authenticate,
    authorize("ADMIN", "PROJECT_MANAGER", "DEVELOPER"),
    validate(getTasksSchema),
    wrapAsync(getTasksController)
  );

  router.get(
    "/:id",
    authenticate,
    authorize("ADMIN", "PROJECT_MANAGER", "DEVELOPER"),
    validate(getTaskByIdSchema),
    wrapAsync(getTaskByIdController)
  );

  router.patch(
    "/:id",
    authenticate,
    authorize("ADMIN", "PROJECT_MANAGER"),
    validate(updateTaskSchema),
    wrapAsync(updateTaskController(io))
  );

  router.delete(
    "/:id",
    authenticate,
    authorize("ADMIN", "PROJECT_MANAGER"),
    validate(deleteTaskSchema),
    wrapAsync(deleteTaskController)
  );

  router.patch(
    "/:id/status",
    authenticate,
    authorize("ADMIN", "PROJECT_MANAGER", "DEVELOPER"),
    validate(updateTaskStatusSchema),
    wrapAsync(updateTaskStatusController(io))
  );

  return router;
};