import jwt from "jsonwebtoken";
import type { Socket } from "socket.io";

import { prisma } from "../lib/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export const authenticateSocket = async (
  socket: Socket,
  next: (error?: Error) => void
) => {
  try {
    const token = socket.handshake.auth.token;

    if (
      typeof token !== "string" ||
      token.trim().length === 0
    ) {
      return next(
        new Error("Authentication required")
      );
    }

    const payload = jwt.verify(
      token,
      JWT_SECRET
    ) as {
      id: number;
    };

    if (
      typeof payload.id !== "number" ||
      !Number.isInteger(payload.id)
    ) {
      return next(
        new Error("Invalid access token")
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: payload.id,
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) {
      return next(
        new Error("User not found")
      );
    }

    if (!user.isActive) {
      return next(
        new Error("User account is inactive")
      );
    }

    socket.data.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error(
      "Socket authentication failed:",
      error
    );

    next(
      new Error(
        "Invalid or expired access token"
      )
    );
  }
};