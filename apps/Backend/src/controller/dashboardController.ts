import type { Request, Response } from "express";
import { getDashboard } from "../services/dashboardService.js";

export const getDashboardController = async (
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

  const dashboard = await getDashboard(req.user.id, req.user.role);

  res.status(200).json({
    success: true,
    data: dashboard,
  });
};