import { prisma } from "../lib/prisma.js";
import type { Role } from "@prisma/client";

export const getActivities = async (
  userId: number,
  role: Role,
  projectId?: number
) => {
  // Admin can see all activity
  if (role === "ADMIN") {
    return prisma.activityLog.findMany({
      where: projectId
        ? {
            projectId,
          }
        : undefined,
      include: {
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
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

  // Project Manager can see activity only from their projects
  if (role === "PROJECT_MANAGER") {
    return prisma.activityLog.findMany({
      where: {
        ...(projectId ? { projectId } : {}),
        project: {
          createdById: userId,
        },
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
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

  // Developer can see activity only for tasks assigned to them
  return prisma.activityLog.findMany({
    where: {
      ...(projectId ? { projectId } : {}),
      task: {
        assignedToId: userId,
      },
    },
    include: {
      task: {
        select: {
          id: true,
          title: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
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