import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { router as apiRouter } from "./routes/api.js";

// Load environment variables
config();

const app: Express = express();
const prisma = new PrismaClient();
const PORT: number = parseInt(process.env.PORT || "3000", 10);

// Test database connection
async function testConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    console.log("✨ Database connection successful");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api", apiRouter);

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  });
});

// Start server and test database connection
testConnection().then((isConnected) => {
  if (isConnected) {
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } else {
    console.error("Server not started due to database connection failure");
    process.exit(1);
  }
});
