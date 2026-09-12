import type { Request, Response } from "express";
import type { Server } from "socket.io";

import { updateTaskStatus } from "../services/taskStatusService.js";
import { getUnreadNotificationCount } from "../services/notificationService.js";

export const updateTaskStatusController = (io: Server) => {
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

    const taskId = Number(req.params.id);

    const result = await updateTaskStatus(
      taskId,
      req.user.id,
      req.user.role,
      req.body.status
    );

    // Send real-time task status update

    io
      .to(`project-${result.task.projectId}`)
      .to("admin-feed")
      .to(`user-${result.task.assignedToId}`)
      .emit("task-status-updated", {
        taskId: result.task.id,
        projectId: result.task.projectId,
        taskTitle: result.task.title,
        user: result.user,
        oldStatus: result.activity.oldStatus,
        newStatus: result.activity.newStatus,
        createdAt: result.activity.createdAt,
      });

    // Send notification to Project Manager

    if (result.notification) {
      const projectManagerId = result.notification.userId;

      io
        .to(`user-${projectManagerId}`)
        .emit(
          "notification-created",
          result.notification
        );

      const unreadCount =
        await getUnreadNotificationCount(
          projectManagerId
        );

      io
        .to(`user-${projectManagerId}`)
        .emit(
          "notification-count-updated",
          {
            count: unreadCount,
          }
        );
    }

    res.status(200).json({
      success: true,
      data: {
        task: result.task,
        activity: result.activity,
      },
    });
  };
};