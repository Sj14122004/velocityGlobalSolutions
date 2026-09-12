import { prisma } from "../lib/prisma.js";
import { hashPassword } from "../utils/password.js";


export const createAdmin = async (data: {
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
      role: "ADMIN",
    },
  });
};

export const getAdmins = async () => {
  return prisma.user.findMany({
    where: {
      role: "ADMIN",
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getAdminById = async (id: number) => {
  return prisma.user.findFirst({
    where: {
      id,
      role: "ADMIN",
    },
  });
};

export const updateAdmin = async (
  id: number,
  data: {
    name?: string;
    email?: string;
  }
) => {
  return prisma.user.updateMany({
    where: {
      id,
      role: "ADMIN",
    },
    data,
  });
};

export const deleteAdmin = async (id: number) => {
  return prisma.user.deleteMany({
    where: {
      id,
      role: "ADMIN",
    },
  });
};