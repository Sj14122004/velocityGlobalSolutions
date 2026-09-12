import type { Request, Response } from "express";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notificationService.js";

export const getNotificationsController = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      },
    });
    return;
  }

  const notifications = await getNotifications(req.user.id);

  res.status(200).json({
    success: true,
    data: notifications,
  });
};

export const getUnreadNotificationCountController = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      },
    });
    return;
  }

  const count = await getUnreadNotificationCount(req.user.id);

  res.status(200).json({
    success: true,
    data: {
      count,
    },
  });
};

export const markNotificationAsReadController = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      },
    });
    return;
  }

  const notificationId = Number(req.params.id);

  const notification = await markNotificationAsRead(
    notificationId,
    req.user.id
  );

  res.status(200).json({
    success: true,
    data: notification,
  });
};

export const markAllNotificationsAsReadController = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      },
    });
    return;
  }

  const result = await markAllNotificationsAsRead(req.user.id);

  res.status(200).json({
    success: true,
    data: {
      updatedCount: result.count,
    },
  });
};