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
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Authentication required",
        },
      });
    }

    const notifications =
      await getNotifications(req.user.id);

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: {
        message: "Failed to get notifications",
      },
    });
  }
};

export const getUnreadNotificationCountController =
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            message: "Authentication required",
          },
        });
      }

      const count =
        await getUnreadNotificationCount(
          req.user.id
        );

      return res.status(200).json({
        success: true,
        data: { count },
      });
    } catch (error) {
      console.error(
        "Get unread notification count error:",
        error
      );

      return res.status(500).json({
        success: false,
        error: {
          message:
            "Failed to get unread notification count",
        },
      });
    }
  };

export const markNotificationAsReadController =
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            message: "Authentication required",
          },
        });
      }

      const notificationId = Number(
        req.params.id
      );

      if (
        !Number.isInteger(notificationId) ||
        notificationId <= 0
      ) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid notification ID",
          },
        });
      }

      const notification =
        await markNotificationAsRead(
          notificationId,
          req.user.id
        );

      return res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "NOTIFICATION_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          error: {
            message: "Notification not found",
          },
        });
      }

      console.error(
        "Mark notification as read error:",
        error
      );

      return res.status(500).json({
        success: false,
        error: {
          message:
            "Failed to mark notification as read",
        },
      });
    }
  };

export const markAllNotificationsAsReadController =
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            message: "Authentication required",
          },
        });
      }

      const result =
        await markAllNotificationsAsRead(
          req.user.id
        );

      return res.status(200).json({
        success: true,
        data: {
          updatedCount: result.count,
        },
      });
    } catch (error) {
      console.error(
        "Mark all notifications as read error:",
        error
      );

      return res.status(500).json({
        success: false,
        error: {
          message:
            "Failed to mark all notifications as read",
        },
      });
    }
  };