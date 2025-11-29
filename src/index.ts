import { PrismaClient } from "@prisma/client";
import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import type { Express, NextFunction, Request, Response } from "express";
import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import http from "http";
import morgan from "morgan";

import { verifyToken } from "./middlewares/verifyToken.middleware";
import { AuthenticationRouter } from "./routes/auth.route";
import { OrderRouter } from "./routes/order.route";
import { ALLOWED_ORIGINS, NODE_ENV, PORT } from "./secrets";
import { initSocket } from "./socket/socket";
import { rateLimiter } from "./utils/rateLimiter";
import { stripeWebhookHandler } from "./webhooks/stripe";

dotenv.config();

const prisma = new PrismaClient();

const app: Express = express();

// mount webhook with raw body

app.post(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhookHandler
);

// 2️⃣ Now apply the normal JSON parser for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));

// Validate environment
const requiredEnvVars = [
  "NODE_ENV",
  "PORT",
  "DATABASE_URL",
  "JWT_SECRET",
  "ENCRYPTION_KEY",
  "ENCRYPTION_IV",
  "ALLOWED_ORIGINS",
  "EMAIL_ADDRESS",
  "EMAIL_PASSWORD",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "PAYPAL_CLIENT",
  "PAYPAL_SECRET",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Read origins from env
const ORIGIN_LIST = ALLOWED_ORIGINS?.split(",") || [];

// Generate variants if needed (http, https, www)
let allowedOrigins = ORIGIN_LIST.flatMap((domain) => {
  const clean = domain.replace(/^https?:\/\//, "").replace(/^www\./, "");
  return [
    `http://${clean}`,
    `https://${clean}`,
    `http://www.${clean}`,
    `https://www.${clean}`,
  ];
});

// CORS setup
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (!allowedOrigins.includes(origin)) {
        return callback(
          new Error(
            "CORS policy does not allow access from the specified origin."
          ),
          false
        );
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Helmet
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// Compression
app.use(compression());
app.use(hpp());

app.get("/", (_, res: Response) => {
  res.json({
    title: "Home",
    message: "Order Management System (OMS) Server Running...",
  });
});

app.get("/health", (_, res: Response) => {
  res.json({
    title: "Server Health",
    success: true,
    message: "Server Running.",
    time: new Date().toISOString(),
  });
});

// rate limiter
app.use("/api", rateLimiter);

// API routes
app.use("/api", AuthenticationRouter);
app.use("/api", verifyToken, OrderRouter);

//  404 (error page)
app.use((req: Request, res: Response) => {
  res.status(404).json({
    title: "404 - Not Found",
    message: "The page you're looking for doesn't exist.",
  });
});

//  API error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.code?.startsWith("P")) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: "Database operation failed",
      error: NODE_ENV === "development" ? err.message : undefined,
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      status: 401,
      message: "Invalid token",
    });
  }

  res.status(err.status || 500).json({
    success: false,
    status: err.status || 500,
    message: err.message || "Something went wrong!",
    stack: NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Initialize socket.io
const httpServer = http.createServer(app);
initSocket(httpServer);

// Start server
const server = httpServer.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log("Database connection closed");
      process.exit(0);
    } catch (error) {
      console.error("Error during shutdown:", error);
      process.exit(1);
    }
  });
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  gracefulShutdown();
});
process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
  gracefulShutdown();
});
