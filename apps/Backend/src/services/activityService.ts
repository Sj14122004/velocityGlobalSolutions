import { prisma } from "../lib/prisma.js";
import type { Role } from "@prisma/client";

export const createActivity = async (data: {
  projectId: number;
  taskId: number;
  userId: number;
  oldStatus: "TO_DO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  newStatus: "TO_DO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
}) => {
  return prisma.activityLog.create({
    data: {
      projectId: data.projectId,
      taskId: data.taskId,
      userId: data.userId,
      oldStatus: data.oldStatus,
      newStatus: data.newStatus,
    },
  });
};

export const getActivities = async (
  userId: number,
  role: Role,
  projectId?: number
) => {
  const projectFilter =
    projectId !== undefined
      ? { projectId }
      : {};

  if (role === "ADMIN") {
    return prisma.activityLog.findMany({
      where: projectFilter,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });
  }

  if (role === "PROJECT_MANAGER") {
    return prisma.activityLog.findMany({
      where: {
        ...projectFilter,
        project: {
          createdById: userId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });
  }

  return prisma.activityLog.findMany({
    where: {
      ...projectFilter,
      task: {
        assignedToId: userId,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
      task: {
        select: {
          id: true,
          title: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  });
};