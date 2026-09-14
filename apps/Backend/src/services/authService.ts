import { createHash } from "crypto";
import { prisma } from "../lib/prisma.js";
import { comparePassword } from "../utils/password.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.js";
import jwt from "jsonwebtoken";



const hashRefreshToken = (token: string): string => {
  return createHash("sha256").update(token).digest("hex");
};

export const login = async (
  email: string,
  password: string
) => {
  const user = await prisma.user.findUnique({
  where: {
    email,
  },
  select: {
    id: true,
    name: true,
    email: true,
    passwordHash: true,
    role: true,
    isActive: true,
  },
});

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  if (!user.isActive) {
    throw new Error("USER_INACTIVE");
  }

  const isPasswordValid = await comparePassword(
    password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  
  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  
  const refreshToken = generateRefreshToken({
    id: user.id,
  });

  
  const tokenHash = hashRefreshToken(refreshToken);

  
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    user: {
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
},
    accessToken,
    refreshToken,
  };
};


const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!REFRESH_TOKEN_SECRET) {
  throw new Error("REFRESH_TOKEN_SECRET is not defined");
}

export const refreshAccessToken = async (refreshToken: string) => {
  const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as {
    id: number;
  };

  
  const tokenHash = createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  
  const storedToken = await prisma.refreshToken.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: true,
    },
  });

  if (!storedToken) {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  
  if (storedToken.revokedAt) {
    throw new Error("REFRESH_TOKEN_REVOKED");
  }

  
  if (storedToken.expiresAt < new Date()) {
    throw new Error("REFRESH_TOKEN_EXPIRED");
  }

  
  if (storedToken.userId !== payload.id) {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  
  if (!storedToken.user.isActive) {
    throw new Error("USER_INACTIVE");
  }

  
  const accessToken = generateAccessToken({
    id: storedToken.user.id,
    email: storedToken.user.email,
    role: storedToken.user.role,
  });

  return {
    accessToken,
  };
};