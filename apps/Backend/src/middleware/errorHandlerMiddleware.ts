import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export const errorHandler: ErrorRequestHandler = (
  error,
  req,
  res,
  next
) => {
  console.error(error);

  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request data",
        details: error.issues.map((issue) => ({
          path: issue.path,
          message: issue.message,
        })),
      },
    });

    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      res.status(409).json({
        success: false,
        error: {
          code: "DUPLICATE_RESOURCE",
          message: "A resource with this value already exists",
        },
      });

      return;
    }

    if (error.code === "P2025") {
      res.status(404).json({
        success: false,
        error: {
          code: "RESOURCE_NOT_FOUND",
          message: "The requested resource was not found",
        },
      });

      return;
    }

    res.status(400).json({
      success: false,
      error: {
        code: "DATABASE_ERROR",
        message: "Database operation failed",
      },
    });

    return;
  }

  if (error instanceof Error) {
    switch (error.message) {
      case "INVALID_CREDENTIALS":
        res.status(401).json({
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        });
        return;

      case "USER_INACTIVE":
        res.status(403).json({
          success: false,
          error: {
            code: "USER_INACTIVE",
            message: "User account is inactive",
          },
        });
        return;

      case "INVALID_REFRESH_TOKEN":
      case "REFRESH_TOKEN_REVOKED":
      case "REFRESH_TOKEN_EXPIRED":
        res.status(401).json({
          success: false,
          error: {
            code: error.message,
            message: "Invalid or expired refresh token",
          },
        });
        return;

      case "PROJECT_NOT_FOUND":
        res.status(404).json({
          success: false,
          error: {
            code: "PROJECT_NOT_FOUND",
            message: "Project not found",
          },
        });
        return;

      case "TASK_NOT_FOUND":
        res.status(404).json({
          success: false,
          error: {
            code: "TASK_NOT_FOUND",
            message: "Task not found",
          },
        });
        return;

      case "DEVELOPER_NOT_FOUND":
        res.status(404).json({
          success: false,
          error: {
            code: "DEVELOPER_NOT_FOUND",
            message: "Developer not found or inactive",
          },
        });
        return;

      case "FORBIDDEN":
        res.status(403).json({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You do not have permission to perform this action",
          },
        });
        return;

      case "TASK_STATUS_UNCHANGED":
        res.status(400).json({
          success: false,
          error: {
            code: "TASK_STATUS_UNCHANGED",
            message: "Task is already in this status",
          },
        });
        return;
    }
  }

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong",
    },
  });
};