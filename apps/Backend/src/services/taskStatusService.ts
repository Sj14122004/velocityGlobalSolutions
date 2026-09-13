import { prisma } from "../lib/prisma.js";
import type { Role, TaskStatus } from "@prisma/client";

export const updateTaskStatus = async (
  taskId: number,
  userId: number,
  role: Role,
  newStatus: TaskStatus
) => {
  return prisma.$transaction(async (tx) => {
    const task = await tx.task.findUnique({
      where: {
        id: taskId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            createdById: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!task) {
      throw new Error("TASK_NOT_FOUND");
    }

    if (
      role === "DEVELOPER" &&
      task.assignedToId !== userId
    ) {
      throw new Error("FORBIDDEN");
    }

    if (
      role === "PROJECT_MANAGER" &&
      task.project.createdById !== userId
    ) {
      throw new Error("TASK_NOT_FOUND");
    }

    if (task.status === newStatus) {
      throw new Error("TASK_STATUS_UNCHANGED");
    }

    const updatedTask = await tx.task.update({
      where: {
        id: taskId,
      },
      data: {
        status: newStatus,
      },
    });

    const activity = await tx.activityLog.create({
      data: {
        taskId: task.id,
        projectId: task.projectId,
        userId,
        oldStatus: task.status,
        newStatus,
      },
    });

    let notification = null;

    if (
      newStatus === "IN_REVIEW" &&
      role === "DEVELOPER" &&
      task.assignedToId === userId &&
      task.project.createdById !== null
    ) {
      notification = await tx.notification.create({
        data: {
          userId: task.project.createdById,
          type: "TASK_MOVED_TO_REVIEW",
          message: `Task "${task.title}" has been moved to In Review.`,
        },
      });
    }

    const user = await tx.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        role: true,
      },
    });

    return {
      task: updatedTask,
      activity,
      user,
      project: task.project,
      projectManagerId: task.project.createdById,
      notification,
    };
  });
};