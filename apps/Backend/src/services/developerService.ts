import { prisma } from "../lib/prisma.js";
import { hashPassword } from "../utils/password.js";

export const createDeveloper = async (data: {
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
      role: "DEVELOPER",
    },
  });
};

export const getDevelopers = async () =>
  prisma.user.findMany({
    where: {
      role: "DEVELOPER",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

export const getDeveloperById = async (id: number) =>
  prisma.user.findFirst({
    where: {
      id,
      role: "DEVELOPER",
    },
  });