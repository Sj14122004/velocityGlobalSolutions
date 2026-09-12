import type { Request, Response } from "express";
import {
  createDeveloper,
  getDevelopers,
  getDeveloperById,
} from "../services/developerService.js";

export const createDeveloperController = async (
  req: Request,
  res: Response
) => {
  const developer = await createDeveloper({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  res.status(201).json({
    success: true,
    data: {
      id: developer.id,
      name: developer.name,
      email: developer.email,
      role: developer.role,
      isActive: developer.isActive,
      createdAt: developer.createdAt,
    },
  });
};

export const getDevelopersController = async (
  req: Request,
  res: Response
) => {
  const developers = await getDevelopers();

  res.status(200).json({
    success: true,
    data: developers,
  });
};

export const getDeveloperByIdController = async (
  req: Request,
  res: Response
) => {
  const id = Number(req.params.id);

  const developer = await getDeveloperById(id);

  if (!developer) {
    res.status(404).json({
      success: false,
      error: {
        code: "DEVELOPER_NOT_FOUND",
        message: "Developer not found",
      },
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: developer,
  });
};