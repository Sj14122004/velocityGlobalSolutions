import { prisma } from "../lib/prisma.js";
import type { Server } from "socket.io";

type NotificationType =
  | "TASK_ASSIGNED"
  | "TASK_MOVED_TO_REVIEW";

export const createNotification = async (
  data: {
    userId: number;
    type: NotificationType;
    message: string;
  },
  io: Server
) => {
  const notification = await prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      message: data.message,
    },
  });

  io.to(`user-${data.userId}`).emit(
    "notification-created",
    notification
  );

  const unreadCount = await prisma.notification.count({
    where: {
      userId: data.userId,
      isRead: false,
    },
  });

  io.to(`user-${data.userId}`).emit(
    "notification-count-updated",
    {
      count: unreadCount,
    }
  );

  return notification;
};

export const getNotifications = async (
  userId: number
) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const getUnreadNotificationCount = async (
  userId: number
) => {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
};

export const markNotificationAsRead = async (
  notificationId: number,
  userId: number
) => {
  const notification =
    await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

  if (!notification) {
    throw new Error("NOTIFICATION_NOT_FOUND");
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

export const markAllNotificationsAsRead = async (
  userId: number
) => {
  return prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};