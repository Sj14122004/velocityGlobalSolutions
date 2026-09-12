import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { initializeSocket } from "./socket/socket.js";
import dotenv from "dotenv";
import { notFound } from "./middleware/notFoundMiddleware.js";
import { corsMiddleware } from "./middleware/corsMiddleware.js";
import { prisma } from "./lib/prisma.js";
import cookieParser from "cookie-parser";

import passport from "./config/passport.js";
import { startOverdueTaskJob } from "./jobs/overdueTaskJob.js";

//middleware
import { errorHandler } from "./middleware/errorHandlerMiddleware.js";


//routes
import adminRoutes from "./routes/adminRoute.js";
import projectManagerRoutes from "./routes/projectManagerRoute.js";
import developerRoutes from "./routes/developerRoute.js";
import projectRoutes from "./routes/projectRoute.js";
import { createTaskRoutes } from "./routes/taskRoute.js";
import authRoutes from "./routes/authRoute.js";
import notificationRoutes from "./routes/notificationRoute.js";
import activityRoutes from "./routes/activityRoute.js";
import dashboardRoutes from "./routes/dashboardRoute.js";

//use express
const app = express();


//middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(cookieParser());


const PORT = Number(process.env.PORT) || 5000;
const httpServer = createServer(app);
const io = initializeSocket(httpServer);

startOverdueTaskJob();

//routes
app.use("/api/auth", authRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/project-managers", projectManagerRoutes);
app.use("/api/developers", developerRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", createTaskRoutes(io));
app.use("/api/notifications", notificationRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/dashboard", dashboardRoutes);

//error middleware
app.use(notFound);
app.use(errorHandler);


// Server 
httpServer.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log("Database connected");
    console.log(`Server running on http://localhost:${PORT}`);
    console.log("Socket.IO server initialized");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
});