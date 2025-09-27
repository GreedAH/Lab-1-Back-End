import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  TypedRequest,
  UserCreateInput,
  UserUpdateInput,
} from "../types/index.js";

const prisma = new PrismaClient();

// Get all users
export const getAllUsers = async (req: any, res: Response) => {
  try {
    const { role } = req.query;

    const whereClause: any = { isDeleted: false };
    if (role) {
      whereClause.role = role;
    }
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        birthday: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Get user by ID
export const getUserById = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findFirst({
      where: {
        id: parseInt(id),
        isDeleted: false,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        birthday: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

// Find user by email
export const findUserByEmail = async (req: any, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await prisma.user.findFirst({
      where: { email, isDeleted: false },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        birthday: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "No user with this email found" });
    }

    return res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user by email" });
  }
};

// Create new user
export const createUser = async (
  req: TypedRequest<UserCreateInput>,
  res: Response
) => {
  try {
    const { firstName, lastName, email, birthday, password, role } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Convert birthday string to proper Date object
    const birthdayDate = new Date(birthday);
    if (isNaN(birthdayDate.getTime())) {
      return res.status(400).json({ error: "Invalid birthday format" });
    }

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        birthday: birthdayDate,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        birthday: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.status(201).json(newUser);
  } catch (error: any) {
    console.log("error", error);
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Failed to create user" });
  }
};

// Update user
export const updateUser = async (
  req: TypedRequest<UserUpdateInput>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email } = req.body;

    // Only allow updating firstName, lastName, and email
    const data = { firstName, lastName, email };

    const updatedUser = await prisma.user.update({
      where: {
        id: parseInt(id),
        isDeleted: false,
      },
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        birthday: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json(updatedUser);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Failed to update user" });
  }
};

// Delete user (soft delete)
export const deleteUser = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    // Soft delete: set isDeleted to true instead of actually deleting
    const deletedUser = await prisma.user.update({
      where: {
        id: parseInt(id),
        isDeleted: false,
      },
      data: { isDeleted: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    res.json({ message: "User deleted successfully", user: deletedUser });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(500).json({ error: "Failed to delete user" });
  }
};
