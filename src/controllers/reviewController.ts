import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import {
  TypedRequest,
  ReviewCreateInput,
  ReviewResponse,
} from "../types/index.js";

const prisma = new PrismaClient();

// Create new review
export const createReview = async (
  req: TypedRequest<ReviewCreateInput>,
  res: Response
) => {
  try {
    const { reviewText, rating, eventId, userId } = req.body;

    // Basic validation
    if (!reviewText || rating === undefined || !eventId || !userId) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (typeof rating !== "number" || rating < 0 || rating > 5) {
      return res
        .status(400)
        .json({ error: "Rating must be a number between 0 and 5" });
    }

    // Verify user exists and is not deleted
    const user = await prisma.user.findFirst({
      where: { id: userId, isDeleted: false },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Verify event exists and is not deleted
    const event = await prisma.event.findFirst({
      where: { id: eventId, isDeleted: false },
    });
    if (!event) return res.status(404).json({ error: "Event not found" });

    const newReview = await prisma.review.create({
      data: {
        reviewText,
        rating,
        eventId,
        userId,
      },
    });

    // Fetch user and event minimal data for response
    const userData = await prisma.user.findUnique({
      where: { id: newReview.userId },
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    const eventData = await prisma.event.findUnique({
      where: { id: newReview.eventId },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        venue: true,
        city: true,
        country: true,
      },
    });

    const response: ReviewResponse = {
      ...newReview,
      user: userData || undefined,
      event: eventData || undefined,
    } as unknown as ReviewResponse;

    res.status(201).json(response);
  } catch (error: any) {
    console.log("error", error);
    res.status(500).json({ error: "Failed to create review" });
  }
};

export default {};

// Soft-delete a review (set isDeleted = true)
export const deleteReview = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "Review id is required" });

    // Find the review and ensure it's not already deleted
    const existing = await prisma.review.findFirst({
      where: { id: parseInt(id), isDeleted: false },
    });

    if (!existing) {
      return res.status(404).json({ error: "Review not found" });
    }

    const deleted = await prisma.review.update({
      where: { id: parseInt(id) },
      data: { isDeleted: true },
    });

    res.json({
      message: "Review deleted (soft) successfully",
      review: deleted,
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Review not found" });
    }
    res.status(500).json({ error: "Failed to delete review" });
  }
};
