import type { Request, Response } from "express";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../services/projectService.js";

export const createProjectController = async (
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

  const project = await createProject({
    name: req.body.name,
    description: req.body.description,
    createdById: req.user.id,
  });

  res.status(201).json({
    success: true,
    data: project,
  });
};

export const getProjectsController = async (
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

  const projects = await getProjects(
    req.user.id,
    req.user.role
  );

  res.status(200).json({
    success: true,
    data: projects,
  });
};

export const getProjectByIdController = async (
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

  const id = Number(req.params.id);

  const project = await getProjectById(
    id,
    req.user.id,
    req.user.role
  );

  if (!project) {
    res.status(404).json({
      success: false,
      error: {
        code: "PROJECT_NOT_FOUND",
        message: "Project not found",
      },
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: project,
  });
};

export const updateProjectController = async (
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

  const id = Number(req.params.id);

  const project = await updateProject(
    id,
    req.user.id,
    req.user.role,
    {
      name: req.body.name,
      description: req.body.description,
    }
  );

  res.status(200).json({
    success: true,
    data: project,
  });
};

export const deleteProjectController = async (
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

  const id = Number(req.params.id);

  await deleteProject(
    id,
    req.user.id,
    req.user.role
  );

  res.status(200).json({
    success: true,
    message: "Project deleted successfully",
  });
};