import { prisma } from "../lib/prisma.js";
import type { Role } from "@prisma/client";

export const createTask = async (
  userId: number,
  role: Role,
  data: {
    projectId: number;
    title: string;
    description?: string;
    assignedToId: number;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    dueDate: Date;
  }
) => {
  return prisma.$transaction(async (tx) => {
    const project = await tx.project.findUnique({
      where: {
        id: data.projectId,
      },
      select: {
        id: true,
        createdById: true,
      },
    });

    if (!project) {
      throw new Error("PROJECT_NOT_FOUND");
    }

    if (
      role === "PROJECT_MANAGER" &&
      project.createdById !== userId
    ) {
      throw new Error("PROJECT_NOT_FOUND");
    }

    const developer = await tx.user.findFirst({
      where: {
        id: data.assignedToId,
        role: "DEVELOPER",
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!developer) {
      throw new Error("DEVELOPER_NOT_FOUND");
    }

    const task = await tx.task.create({
      data: {
        projectId: data.projectId,
        title: data.title,
        description: data.description,
        assignedToId: data.assignedToId,
        priority: data.priority ?? "MEDIUM",
        dueDate: data.dueDate,
      },
    });

    const notification = await tx.notification.create({
      data: {
        userId: data.assignedToId,
        type: "TASK_ASSIGNED",
        message: `You have been assigned to ${task.title}.`,
      },
    });

    return {
      task,
      notification,
    };
  });
};

export const getTasks = async (
  userId: number,
  role: Role,
  filters: {
    status?: "TO_DO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
    priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    dueFrom?: Date;
    dueTo?: Date;
  } = {}
) => {
  const where = {
    ...(filters.status
      ? {
          status: filters.status,
        }
      : {}),

    ...(filters.priority
      ? {
          priority: filters.priority,
        }
      : {}),

    ...(filters.dueFrom || filters.dueTo
      ? {
          dueDate: {
            ...(filters.dueFrom
              ? {
                  gte: filters.dueFrom,
                }
              : {}),

            ...(filters.dueTo
              ? {
                  lte: filters.dueTo,
                }
              : {}),
          },
        }
      : {}),
  };

  if (role === "ADMIN") {
    return prisma.task.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  if (role === "PROJECT_MANAGER") {
    return prisma.task.findMany({
      where: {
        ...where,
        project: {
          createdById: userId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  return prisma.task.findMany({
    where: {
      ...where,
      assignedToId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getTaskById = async (
  id: number,
  userId: number,
  role: Role
) => {
  if (role === "ADMIN") {
    return prisma.task.findUnique({
      where: {
        id,
      },
    });
  }

  if (role === "PROJECT_MANAGER") {
    return prisma.task.findFirst({
      where: {
        id,
        project: {
          createdById: userId,
        },
      },
    });
  }

  return prisma.task.findFirst({
    where: {
      id,
      assignedToId: userId,
    },
  });
};

// Update Task

export const updateTask = async (
  id: number,
  userId: number,
  role: Role,
  data: {
    title?: string;
    description?: string;
    assignedToId?: number;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    dueDate?: Date;
  }
) => {
  if (role !== "ADMIN" && role !== "PROJECT_MANAGER") {
    throw new Error("FORBIDDEN");
  }

  const existingTask = await prisma.task.findUnique({
    where: {
      id,
    },
    include: {
      project: {
        select: {
          createdById: true,
        },
      },
    },
  });

  if (!existingTask) {
    throw new Error("TASK_NOT_FOUND");
  }

  if (
    role === "PROJECT_MANAGER" &&
    existingTask.project.createdById !== userId
  ) {
    throw new Error("TASK_NOT_FOUND");
  }

  if (data.assignedToId !== undefined) {
    const developer = await prisma.user.findFirst({
      where: {
        id: data.assignedToId,
        role: "DEVELOPER",
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!developer) {
      throw new Error("DEVELOPER_NOT_FOUND");
    }
  }

  const isReassigned =
    data.assignedToId !== undefined &&
    data.assignedToId !== existingTask.assignedToId;

  const result = await prisma.$transaction(async (tx) => {
    const task = await tx.task.update({
      where: {
        id,
      },
      data,
    });

    let notification = null;

    if (isReassigned) {
      notification = await tx.notification.create({
        data: {
          userId: data.assignedToId!,
          type: "TASK_ASSIGNED",
          message: `You have been assigned to ${task.title}.`,
        },
      });
    }

    return {
      task,
      notification,
    };
  });

  return result;
};

export const deleteTask = async (
  id: number,
  userId: number,
  role: Role
) => {
  if (role === "ADMIN") {
    return prisma.task.delete({
      where: {
        id,
      },
    });
  }

  if (role === "PROJECT_MANAGER") {
    const task = await prisma.task.findFirst({
      where: {
        id,
        project: {
          createdById: userId,
        },
      },
    });

    if (!task) {
      throw new Error("TASK_NOT_FOUND");
    }

    return prisma.task.delete({
      where: {
        id,
      },
    });
  }

  throw new Error("FORBIDDEN");
};