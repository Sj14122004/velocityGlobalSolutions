import { prisma } from "../lib/prisma.js";
import { hashPassword } from "../utils/password.js";

export const createProjectManager = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const passwordHash = await hashPassword(data.password);

  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: "PROJECT_MANAGER",
    },
  });
};

export const getProjectManagers = async () =>
  prisma.user.findMany({
    where: {
      role: "PROJECT_MANAGER",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

export const getProjectManagerById = async (id: number) =>
  prisma.user.findFirst({
    where: {
      id,
      role: "PROJECT_MANAGER",
    },
  });