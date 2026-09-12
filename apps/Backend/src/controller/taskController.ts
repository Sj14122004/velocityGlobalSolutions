import type { Request, Response } from "express";
import type { Server } from "socket.io";
import type { Priority, TaskStatus } from "@prisma/client";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../services/taskService.js";
import { getUnreadNotificationCount } from "../services/notificationService.js";

export const createTaskController = (io: Server) => {
  return async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
      return;
    }

    const result = await createTask(
      req.user.id,
      req.user.role,
      {
        projectId: req.body.projectId,
        title: req.body.title,
        description: req.body.description,
        assignedToId: req.body.assignedToId,
        priority: req.body.priority,
        dueDate: new Date(req.body.dueDate),
      }
    );

    const { task, notification } = result;

    io.to(`user-${task.assignedToId}`).emit(
      "notification-created",
      notification
    );

    const unreadCount = await getUnreadNotificationCount(
      task.assignedToId
    );

    io.to(`user-${task.assignedToId}`).emit(
      "notification-count-updated",
      {
        count: unreadCount,
      }
    );

    res.status(201).json({
      success: true,
      data: task,
    });
  };
};

export const getTasksController = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      },
    });
    return;
  }

  const status =
    typeof req.query.status === "string"
      ? (req.query.status as TaskStatus)
      : undefined;

  const priority =
    typeof req.query.priority === "string"
      ? (req.query.priority as Priority)
      : undefined;

  const dueFrom =
    typeof req.query.dueFrom === "string"
      ? new Date(req.query.dueFrom)
      : undefined;

  const dueTo =
    typeof req.query.dueTo === "string"
      ? new Date(req.query.dueTo)
      : undefined;

  const tasks = await getTasks(
    req.user.id,
    req.user.role,
    {
      status,
      priority,
      dueFrom,
      dueTo,
    }
  );

  res.status(200).json({
    success: true,
    data: tasks,
  });
};

export const getTaskByIdController = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      },
    });
    return;
  }

  const id = Number(req.params.id);

  const task = await getTaskById(
    id,
    req.user.id,
    req.user.role
  );

  if (!task) {
    res.status(404).json({
      success: false,
      error: {
        code: "TASK_NOT_FOUND",
        message: "Task not found",
      },
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: task,
  });
};

export const updateTaskController = (io: Server) => {
  return async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
      return;
    }

    const id = Number(req.params.id);

    const result = await updateTask(
      id,
      req.user.id,
      req.user.role,
      {
        title: req.body.title,
        description: req.body.description,
        assignedToId: req.body.assignedToId,
        priority: req.body.priority,
        dueDate: req.body.dueDate
          ? new Date(req.body.dueDate)
          : undefined,
      }
    );

    if (result.notification) {
      const unreadCount = await getUnreadNotificationCount(
        result.notification.userId
      );

      io.to(
        `user-${result.notification.userId}`
      ).emit(
        "notification-created",
        result.notification
      );

      io.to(
        `user-${result.notification.userId}`
      ).emit(
        "notification-count-updated",
        {
          count: unreadCount,
        }
      );
    }

    res.status(200).json({
      success: true,
      data: result.task,
    });
  };
};

export const deleteTaskController = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      },
    });
    return;
  }

  const id = Number(req.params.id);

  await deleteTask(
    id,
    req.user.id,
    req.user.role
  );

  res.status(200).json({
    success: true,
    message: "Task deleted successfully",
  });
};