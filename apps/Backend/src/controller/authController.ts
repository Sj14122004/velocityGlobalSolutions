import type { Request, Response } from "express";
import {
  login,
  refreshAccessToken,
} from "../services/authService.js";


export const loginController = async (
  req: Request,
  res: Response
) => {
  const { email, password } = req.body;

  const result = await login(email, password);

  // Store refresh token in HttpOnly cookie
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });


  res.status(200).json({
    success: true,
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
};


export const refreshController = async (
  req: Request,
  res: Response
) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(401).json({
      success: false,
      error: {
        code: "REFRESH_TOKEN_MISSING",
        message: "Refresh token is required",
      },
    });
    return;
  }

  const result = await refreshAccessToken(refreshToken);

  res.status(200).json({
    success: true,
    data: {
      accessToken: result.accessToken,
    },
  });
};