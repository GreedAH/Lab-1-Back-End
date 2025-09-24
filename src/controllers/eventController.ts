import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import {
  TypedRequest,
  EventCreateInput,
  EventUpdateInput,
} from "../types/index.js";

const prisma = new PrismaClient();

// Get all events (excluding deleted ones)
export const getAllEvents = async (req: any, res: Response) => {
  try {
    const { status, country, city } = req.query;

    const whereClause: any = { isDeleted: false };
    if (status) {
      whereClause.status = status;
    }
    if (country) {
      whereClause.country = country;
    }
    if (city) {
      whereClause.city = city;
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        description: true,
        startDate: true,
        endDate: true,
        venue: true,
        country: true,
        city: true,
        status: true,
        maxCapacity: true,
        price: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        startDate: "asc",
      },
    });

    // Attach reservation count for each event (excluding cancelled)
    const eventsWithReservationCount = await Promise.all(
      events.map(async (event) => {
        const reservationCount = await prisma.reservation.count({
          where: {
            eventId: event.id,
            isCancelled: false,
          },
        });
        return { ...event, reservationCount };
      })
    );
    res.json(eventsWithReservationCount);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

// Get all events sorted by status (open events first) - Public route
export const getAllEventsSortedByStatus = async (req: any, res: Response) => {
  try {
    const { country, city } = req.query;

    const whereClause: any = { isDeleted: false };
    if (country) {
      whereClause.country = country;
    }
    if (city) {
      whereClause.city = city;
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        description: true,
        startDate: true,
        endDate: true,
        venue: true,
        country: true,
        city: true,
        status: true,
        maxCapacity: true,
        price: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        {
          status: "asc", // This will put OPEN first, then other statuses alphabetically
        },
        {
          startDate: "asc",
        },
      ],
    });

    // Attach reservation count for each event (excluding cancelled)
    const eventsWithReservationCount = await Promise.all(
      events.map(async (event) => {
        const reservationCount = await prisma.reservation.count({
          where: {
            eventId: event.id,
            isCancelled: false,
          },
        });
        return { ...event, reservationCount };
      })
    );

    // Custom sorting to ensure OPEN events come first
    const sortedEvents = eventsWithReservationCount.sort((a, b) => {
      if (a.status === "OPEN" && b.status !== "OPEN") return -1;
      if (a.status !== "OPEN" && b.status === "OPEN") return 1;
      return 0; // Keep original order for same status
    });

    res.json(sortedEvents);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events" });
  }
};

// Get event by ID
export const getEventById = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const event = await prisma.event.findFirst({
      where: {
        id: parseInt(id),
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        description: true,
        startDate: true,
        endDate: true,
        venue: true,
        country: true,
        city: true,
        status: true,
        maxCapacity: true,
        price: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Attach reservation count for this event (excluding cancelled)
    const reservationCount = await prisma.reservation.count({
      where: {
        eventId: event.id,
        isCancelled: false,
      },
    });
    res.json({ ...event, reservationCount });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch event" });
  }
};

// Create new event
export const createEvent = async (
  req: TypedRequest<EventCreateInput>,
  res: Response
) => {
  try {
    const {
      name,
      description,
      startDate,
      endDate,
      venue,
      country,
      city,
      status,
      maxCapacity,
      price,
    } = req.body;

    // Validate dates
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    if (startDateObj > endDateObj) {
      return res
        .status(400)
        .json({ error: "Start date must be before end date" });
    }

    // Validate capacity and price
    if (maxCapacity <= 0) {
      return res
        .status(400)
        .json({ error: "Max capacity must be greater than 0" });
    }

    if (price < 0) {
      return res.status(400).json({ error: "Price cannot be negative" });
    }

    const newEvent = await prisma.event.create({
      data: {
        name,
        description,
        startDate: startDateObj,
        endDate: endDateObj,
        venue,
        country,
        city,
        status: status || "OPEN",
        maxCapacity,
        price,
      },
      select: {
        id: true,
        name: true,
        description: true,
        startDate: true,
        endDate: true,
        venue: true,
        country: true,
        city: true,
        status: true,
        maxCapacity: true,
        price: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.status(201).json(newEvent);
  } catch (error: any) {
    console.log("error", error);
    res.status(500).json({ error: "Failed to create event" });
  }
};

// Update event
export const updateEvent = async (
  req: TypedRequest<EventUpdateInput>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      startDate,
      endDate,
      venue,
      country,
      city,
      status,
      maxCapacity,
      price,
    } = req.body;

    // Build update data object with only provided fields
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (venue !== undefined) updateData.venue = venue;
    if (country !== undefined) updateData.country = country;
    if (city !== undefined) updateData.city = city;
    if (status !== undefined) updateData.status = status;
    if (maxCapacity !== undefined) updateData.maxCapacity = maxCapacity;
    if (price !== undefined) updateData.price = price;

    // Handle date updates with validation
    if (startDate !== undefined) {
      const startDateObj = new Date(startDate);
      if (isNaN(startDateObj.getTime())) {
        return res.status(400).json({ error: "Invalid start date format" });
      }
      updateData.startDate = startDateObj;
    }

    if (endDate !== undefined) {
      const endDateObj = new Date(endDate);
      if (isNaN(endDateObj.getTime())) {
        return res.status(400).json({ error: "Invalid end date format" });
      }
      updateData.endDate = endDateObj;
    }

    // Validate date relationship if both dates are being updated
    if (startDate !== undefined && endDate !== undefined) {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      if (startDateObj > endDateObj) {
        return res
          .status(400)
          .json({ error: "Start date must be before end date" });
      }
    }

    // Validate capacity and price
    if (maxCapacity !== undefined && maxCapacity <= 0) {
      return res
        .status(400)
        .json({ error: "Max capacity must be greater than 0" });
    }

    if (price !== undefined && price < 0) {
      return res.status(400).json({ error: "Price cannot be negative" });
    }

    const updatedEvent = await prisma.event.update({
      where: {
        id: parseInt(id),
        isDeleted: false,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        description: true,
        startDate: true,
        endDate: true,
        venue: true,
        country: true,
        city: true,
        status: true,
        maxCapacity: true,
        price: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json(updatedEvent);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Event not found" });
    }
    res.status(500).json({ error: "Failed to update event" });
  }
};

// Delete event (soft delete)
export const deleteEvent = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    // Soft delete: set isDeleted to true instead of actually deleting
    const deletedEvent = await prisma.event.update({
      where: {
        id: parseInt(id),
        isDeleted: false,
      },
      data: { isDeleted: true },
      select: {
        id: true,
        name: true,
        venue: true,
        city: true,
        country: true,
      },
    });

    res.json({ message: "Event deleted successfully", event: deletedEvent });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Event not found" });
    }
    res.status(500).json({ error: "Failed to delete event" });
  }
};
