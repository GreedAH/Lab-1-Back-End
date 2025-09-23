import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import {
  TypedRequest,
  ReservationCreateInput,
  ReservationResponse,
} from "../types/index.js";

const prisma = new PrismaClient();

// Create reservation
export const createReservation = async (
  req: TypedRequest<ReservationCreateInput>,
  res: Response
) => {
  try {
    const { userId, eventId } = req.body;

    // Validate input
    if (!userId || !eventId) {
      return res.status(400).json({ error: "userId and eventId are required" });
    }

    // Check if user exists and is not deleted
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        isDeleted: false,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if event exists, is not deleted, and is open for reservations
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        isDeleted: false,
        status: "OPEN",
      },
    });

    if (!event) {
      return res.status(404).json({
        error: "Event not found or not available for reservations",
      });
    }

    // Check if user already has a reservation for this event
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        userId: userId,
        eventId: eventId,
        isDeleted: false,
      },
    });

    if (existingReservation) {
      return res.status(400).json({
        error: "User already has a reservation for this event",
      });
    }

    // Check event capacity
    const currentReservations = await prisma.reservation.count({
      where: {
        eventId: eventId,
        isDeleted: false,
        isCancelled: false,
      },
    });

    if (currentReservations >= event.maxCapacity) {
      return res.status(400).json({
        error: "Event is at maximum capacity",
      });
    }

    // Create reservation
    const newReservation = await prisma.reservation.create({
      data: {
        userId: userId,
        eventId: eventId,
        price: event.price,
      },
    });

    // Fetch user and event data separately for response
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    const eventData = await prisma.event.findUnique({
      where: { id: eventId },
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

    const response: ReservationResponse = {
      ...newReservation,
      user: userData || undefined,
      event: eventData || undefined,
    };

    res.status(201).json(response);
  } catch (error: any) {
    console.log("error", error);
    res.status(500).json({ error: "Failed to create reservation" });
  }
};

// Cancel reservation
export const cancelReservation = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    // Check if reservation exists and is not already cancelled or deleted
    const reservation = await prisma.reservation.findFirst({
      where: {
        id: parseInt(id),
        isDeleted: false,
        isCancelled: false,
      },
    });

    if (!reservation) {
      return res.status(404).json({
        error: "Reservation not found or already cancelled",
      });
    }

    // Get event data to check if it has started
    const event = await prisma.event.findUnique({
      where: { id: reservation.eventId },
      select: { startDate: true },
    });

    if (!event) {
      return res.status(404).json({ error: "Associated event not found" });
    }

    // Check if event has already started (optional business rule)
    const now = new Date();
    if (event.startDate <= now) {
      return res.status(400).json({
        error:
          "Cannot cancel reservation for an event that has already started",
      });
    }

    // Cancel the reservation
    const cancelledReservation = await prisma.reservation.update({
      where: {
        id: parseInt(id),
      },
      data: {
        isCancelled: true,
      },
    });

    // Fetch user and event data separately for response
    const userData = await prisma.user.findUnique({
      where: { id: cancelledReservation.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    const eventData = await prisma.event.findUnique({
      where: { id: cancelledReservation.eventId },
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

    const response: ReservationResponse = {
      ...cancelledReservation,
      user: userData || undefined,
      event: eventData || undefined,
    };

    res.json({
      message: "Reservation cancelled successfully",
      reservation: response,
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Reservation not found" });
    }
    res.status(500).json({ error: "Failed to cancel reservation" });
  }
};

// Get reservations by user ID
export const getReservationsByUserId = async (req: any, res: Response) => {
  try {
    const { userId } = req.params;
    const { includeCancelled } = req.query;

    const whereClause: any = {
      userId: parseInt(userId),
      isDeleted: false,
    };

    // If includeCancelled is not true, exclude cancelled reservations
    if (includeCancelled !== "true") {
      whereClause.isCancelled = false;
    }

    const reservations = await prisma.reservation.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Fetch user and event data for each reservation
    const reservationsWithData = await Promise.all(
      reservations.map(async (reservation) => {
        const [userData, eventData] = await Promise.all([
          prisma.user.findUnique({
            where: { id: reservation.userId },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          }),
          prisma.event.findUnique({
            where: { id: reservation.eventId },
            select: {
              id: true,
              name: true,
              startDate: true,
              endDate: true,
              venue: true,
              city: true,
              country: true,
              status: true,
            },
          }),
        ]);

        return {
          ...reservation,
          user: userData || undefined,
          event: eventData || undefined,
        };
      })
    );

    res.json(reservationsWithData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user reservations" });
  }
};

// Get reservations by event ID
export const getReservationsByEventId = async (req: any, res: Response) => {
  try {
    const { eventId } = req.params;
    const { includeCancelled } = req.query;

    const whereClause: any = {
      eventId: parseInt(eventId),
      isDeleted: false,
    };

    // If includeCancelled is not true, exclude cancelled reservations
    if (includeCancelled !== "true") {
      whereClause.isCancelled = false;
    }

    const reservations = await prisma.reservation.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Fetch user and event data for each reservation
    const reservationsWithData = await Promise.all(
      reservations.map(async (reservation) => {
        const [userData, eventData] = await Promise.all([
          prisma.user.findUnique({
            where: { id: reservation.userId },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          }),
          prisma.event.findUnique({
            where: { id: reservation.eventId },
            select: {
              id: true,
              name: true,
              startDate: true,
              endDate: true,
              venue: true,
              city: true,
              country: true,
              status: true,
            },
          }),
        ]);

        return {
          ...reservation,
          user: userData || undefined,
          event: eventData || undefined,
        };
      })
    );

    res.json(reservationsWithData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch event reservations" });
  }
};
