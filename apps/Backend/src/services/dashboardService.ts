import { prisma } from "../lib/prisma.js";
import type { Role } from "@prisma/client";
import { getOnlineUsersCount } from "../socket/socket.js";

export const getAdminDashboard = async () => {
  const [totalProjects, tasksByStatus, overdueCount] = await Promise.all([
    prisma.project.count(),

    prisma.task.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    }),

    prisma.task.count({
      where: {
        isOverdue: true,
      },
    }),
  ]);

  const taskStatusCounts = {
    TO_DO: 0,
    IN_PROGRESS: 0,
    IN_REVIEW: 0,
    DONE: 0,
  };

  for (const item of tasksByStatus) {
    taskStatusCounts[item.status] = item._count.id;
  }

  const activeUsers = getOnlineUsersCount();

  return {
    totalProjects,
    totalTasksByStatus: taskStatusCounts,
    overdueCount,
    activeUsers,
  };
};

export const getProjectManagerDashboard = async (userId: number) => {
  const startOfWeek = new Date();

  startOfWeek.setDate(
    startOfWeek.getDate() - startOfWeek.getDay()
  );

  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);

  endOfWeek.setDate(
    endOfWeek.getDate() + 7
  );

  const [
    totalProjects,
    tasksByPriority,
    upcomingTasks,
  ] = await Promise.all([
    prisma.project.count({
      where: {
        createdById: userId,
      },
    }),

    prisma.task.groupBy({
      by: ["priority"],
      where: {
        project: {
          createdById: userId,
        },
      },
      _count: {
        id: true,
      },
    }),

    prisma.task.findMany({
      where: {
        project: {
          createdById: userId,
        },
        dueDate: {
          gte: startOfWeek,
          lt: endOfWeek,
        },
        isOverdue: false,
      },
      select: {
        id: true,
        title: true,
        priority: true,
        status: true,
        dueDate: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    }),
  ]);

  const taskPriorityCounts = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    CRITICAL: 0,
  };

  for (const item of tasksByPriority) {
    taskPriorityCounts[item.priority] = item._count.id;
  }

  return {
    totalProjects,
    tasksByPriority: taskPriorityCounts,
    upcomingTasks,
  };
};

export const getDeveloperDashboard = async (userId: number) => {
  return prisma.task.findMany({
    where: {
      assignedToId: userId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      dueDate: true,
      isOverdue: true,
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [
      {
        priority: "desc",
      },
      {
        dueDate: "asc",
      },
    ],
  });
};

export const getDashboard = async (
  userId: number,
  role: Role
) => {
  if (role === "ADMIN") {
    return getAdminDashboard();
  }

  if (role === "PROJECT_MANAGER") {
    return getProjectManagerDashboard(userId);
  }

  return getDeveloperDashboard(userId);
};