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
export const getAllUsers = async (_req: any, res: Response) => {
  try {
    const users = await prisma.user.findMany({
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
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
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
    const { firstName, lastName, email, birthday, password, role } = req.body;

    // If password is provided, hash it
    const data: any = { firstName, lastName, email, birthday, role };
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
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

// Delete user
export const deleteUser = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(500).json({ error: "Failed to delete user" });
  }
};
