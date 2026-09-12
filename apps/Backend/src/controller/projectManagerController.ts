import type { Request, Response } from "express";
import {
  createProjectManager,
  getProjectManagers,
  getProjectManagerById,
} from "../services/projectManagerService.js";

export const createProjectManagerController = async (
  req: Request,
  res: Response
) => {
  const projectManager = await createProjectManager({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  res.status(201).json({
    success: true,
    data: {
      id: projectManager.id,
      name: projectManager.name,
      email: projectManager.email,
      role: projectManager.role,
      isActive: projectManager.isActive,
      createdAt: projectManager.createdAt,
    },
  });
};

export const getProjectManagersController = async (
  req: Request,
  res: Response
) => {
  const projectManagers = await getProjectManagers();

  res.status(200).json({
    success: true,
    data: projectManagers,
  });
};

export const getProjectManagerByIdController = async (
  req: Request,
  res: Response
) => {
  const id = Number(req.params.id);

  const projectManager = await getProjectManagerById(id);

  if (!projectManager) {
    res.status(404).json({
      success: false,
      error: {
        code: "PROJECT_MANAGER_NOT_FOUND",
        message: "Project Manager not found",
      },
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: projectManager,
  });
};