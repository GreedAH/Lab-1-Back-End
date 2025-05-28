import express, { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { body, validationResult } from "express-validator";
import {
  TypedRequest,
  ExampleCreateInput,
  ExampleUpdateInput,
} from "../types/index.js";

const router: Router = express.Router();
const prisma = new PrismaClient();

// GET all examples
router.get("/examples", async (_req, res: Response) => {
  try {
    const examples = await prisma.example.findMany();
    res.json(examples);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch examples" });
  }
});

// GET example by ID
router.get("/examples/:id", async (req, res: Response) => {
  try {
    const { id } = req.params;
    const example = await prisma.example.findUnique({
      where: { id: parseInt(id) },
    });

    if (!example) {
      return res.status(404).json({ error: "Example not found" });
    }

    res.json(example);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch example" });
  }
});

// CREATE new example
router.post(
  "/examples",
  body("name").notEmpty().trim(),
  body("email").isEmail(),
  async (req: TypedRequest<ExampleCreateInput>, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email } = req.body;
      const newExample = await prisma.example.create({
        data: { name, email },
      });
      res.status(201).json(newExample);
    } catch (error: any) {
      if (error.code === "P2002") {
        return res.status(400).json({ error: "Email already exists" });
      }
      res.status(500).json({ error: "Failed to create example" });
    }
  }
);

// UPDATE example
router.put(
  "/examples/:id",
  body("name").optional().notEmpty().trim(),
  body("email").optional().isEmail(),
  async (req: TypedRequest<ExampleUpdateInput>, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { name, email } = req.body;
      const updatedExample = await prisma.example.update({
        where: { id: parseInt(id) },
        data: { name, email },
      });
      res.json(updatedExample);
    } catch (error: any) {
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Example not found" });
      }
      res.status(500).json({ error: "Failed to update example" });
    }
  }
);

// DELETE example
router.delete("/examples/:id", async (req, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.example.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Example not found" });
    }
    res.status(500).json({ error: "Failed to delete example" });
  }
});

export { router };
