// Admin Controller
import type { Request, Response } from "express";
import {
  createAdmin,
  getAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
} from "../services/adminService.js";

export const createAdminController = async (
  req: Request,
  res: Response
) => {
  const admin = await createAdmin({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  res.status(201).json({
    success: true,
    data: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
      createdAt: admin.createdAt,
    },
  });
};

export const getAdminsController = async (
  req: Request,
  res: Response
) => {
  const admins = await getAdmins();

  res.status(200).json({
    success: true,
    data: admins,
  });
};

export const getAdminByIdController = async (
  req: Request,
  res: Response
) => {
  const id = Number(req.params.id);

  const admin = await getAdminById(id);

  if (!admin) {
    res.status(404).json({
      success: false,
      error: {
        code: "ADMIN_NOT_FOUND",
        message: "Admin not found",
      },
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: admin,
  });
};

export const updateAdminController = async (
  req: Request,
  res: Response
) => {
  const id = Number(req.params.id);

  const result = await updateAdmin(id, {
    name: req.body.name,
    email: req.body.email,
  });

  if (result.count === 0) {
    res.status(404).json({
      success: false,
      error: {
        code: "ADMIN_NOT_FOUND",
        message: "Admin not found",
      },
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: "Admin updated successfully",
  });
};

export const deleteAdminController = async (
  req: Request,
  res: Response
) => {
  const id = Number(req.params.id);

  const result = await deleteAdmin(id);

  if (result.count === 0) {
    res.status(404).json({
      success: false,
      error: {
        code: "ADMIN_NOT_FOUND",
        message: "Admin not found",
      },
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: "Admin deleted successfully",
  });
};