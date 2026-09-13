import type { Request, Response } from "express";
import { getActivities } from "../services/activityService.js";

export const getActivitiesController = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        message: "Authentication required",
      },
    });
  }

  const projectId = req.query.projectId
    ? Number(req.query.projectId)
    : undefined;

  const activities = await getActivities(
    req.user.id,
    req.user.role,
    projectId
  );

  return res.status(200).json({
    success: true,
    data: activities,
  });
};