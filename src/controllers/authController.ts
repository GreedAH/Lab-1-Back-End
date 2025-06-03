import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  ACCESS_TOKEN_EXPIRY,
  JWT_REFRESH_SECRET,
  JWT_SECRET,
  REFRESH_TOKEN_EXPIRY,
} from "../utils/consts.js";

const prisma = new PrismaClient();

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error("JWT secrets must be defined in environment variables");
}

interface TokenPayload {
  userId: number;
  email: string;
  role?: string;
}

// Generate a shorter refresh token
const generateRefreshToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create token payload
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    // Generate access token
    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY as jwt.SignOptions["expiresIn"],
    });

    // Generate a shorter refresh token
    const refreshToken = generateRefreshToken();

    // Calculate expiry date for refresh token
    const refreshTokenDuration = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

    // Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + refreshTokenDuration),
      },
    });

    // Remove sensitive data
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(401).json({ message: "Refresh token is required" });
    }

    // Verify refresh token exists and is valid
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!storedToken || new Date() > storedToken.expiresAt) {
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }

    // Verify JWT
    const payload = jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY as jwt.SignOptions["expiresIn"] }
    );

    return res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    // Delete refresh token from database
    await prisma.refreshToken.delete({
      where: { token: refreshToken },
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
