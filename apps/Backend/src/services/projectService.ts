// Project Service

import { prisma } from "../lib/prisma.js";
import type { Role } from "@prisma/client";

export const createProject = async (data: {
  name: string;
  description?: string;
  createdById: number;
}) => {
  return prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      createdById: data.createdById,
    },
  });
};

export const getProjects = async (
  userId: number,
  role: Role
) => {
  if (role === "ADMIN") {
    return prisma.project.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  if (role === "PROJECT_MANAGER") {
    return prisma.project.findMany({
      where: {
        createdById: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  return prisma.project.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getProjectById = async (
  id: number,
  userId: number,
  role: Role
) => {
  if (role === "ADMIN") {
    return prisma.project.findUnique({
      where: {
        id,
      },
    });
  }

  if (role === "PROJECT_MANAGER") {
    return prisma.project.findFirst({
      where: {
        id,
        createdById: userId,
      },
    });
  }

  return prisma.project.findFirst({
    where: {
      id,
      members: {
        some: {
          userId,
        },
      },
    },
  });
};

export const updateProject = async (
  id: number,
  userId: number,
  role: Role,
  data: {
    name?: string;
    description?: string;
  }
) => {
  if (role === "ADMIN") {
    return prisma.project.update({
      where: {
        id,
      },
      data,
    });
  }

  if (role === "PROJECT_MANAGER") {
    const project = await prisma.project.findFirst({
      where: {
        id,
        createdById: userId,
      },
    });

    if (!project) {
      throw new Error("PROJECT_NOT_FOUND");
    }

    return prisma.project.update({
      where: {
        id,
      },
      data,
    });
  }

  throw new Error("FORBIDDEN");
};

export const deleteProject = async (
  id: number,
  userId: number,
  role: Role
) => {
  if (role === "ADMIN") {
    return prisma.project.delete({
      where: {
        id,
      },
    });
  }

  if (role === "PROJECT_MANAGER") {
    const project = await prisma.project.findFirst({
      where: {
        id,
        createdById: userId,
      },
    });

    if (!project) {
      throw new Error("PROJECT_NOT_FOUND");
    }

    return prisma.project.delete({
      where: {
        id,
      },
    });
  }

  throw new Error("FORBIDDEN");
};