import { prisma } from "../lib/prisma.js";
import type { Role } from "@prisma/client";

export const createProject = async (
  userId: number,
  role: Role,
  data: {
    name: string;
    description?: string;
    developerIds?: number[];
  }
) => {
  if (
    role !== "ADMIN" &&
    role !== "PROJECT_MANAGER"
  ) {
    throw new Error("FORBIDDEN");
  }

  const developerIds = [
    ...new Set(data.developerIds ?? []),
  ];

  if (developerIds.length > 0) {
    const developers =
      await prisma.user.findMany({
        where: {
          id: {
            in: developerIds,
          },
          role: "DEVELOPER",
          isActive: true,
        },
        select: {
          id: true,
        },
      });

    if (
      developers.length !==
      developerIds.length
    ) {
      throw new Error(
        "INVALID_DEVELOPERS"
      );
    }
  }

  const project =
    await prisma.$transaction(
      async (tx) => {
        const createdProject =
          await tx.project.create({
            data: {
              name: data.name,
              description:
                data.description,
              createdById: userId,
            },
          });

        if (developerIds.length > 0) {
          await tx.projectMember.createMany({
            data: developerIds.map(
              (developerId) => ({
                projectId:
                  createdProject.id,
                userId: developerId,
              })
            ),
            skipDuplicates: true,
          });
        }

        return tx.project.findUnique({
          where: {
            id: createdProject.id,
          },
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                  },
                },
              },
            },
          },
        });
      }
    );

  return project;
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
  const accessFilter =
    role === "ADMIN"
      ? {}
      : role === "PROJECT_MANAGER"
        ? { createdById: userId }
        : {
            members: {
              some: {
                userId,
              },
            },
          };

  return prisma.project.findFirst({
    where: {
      id,
      ...accessFilter,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isActive: true,
            },
          },
        },
      },
      tasks: {
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      activityLogs: {
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
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
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