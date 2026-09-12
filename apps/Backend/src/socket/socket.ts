import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { prisma } from "../lib/prisma.js";
import { authenticateSocket } from "./socketAuth.js";
import { getActivities } from "../services/activityService.js";


const onlineUsers = new Map<number, number>();

export const getOnlineUsersCount = () => onlineUsers.size;


export const initializeSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin:
        process.env.FRONTEND_URL ||
        "http://localhost:5173",
      credentials: true,
    },
  });

  // Track active sockets for each user

  const onlineUsers = new Map<number, number>();

  // Authenticate every socket connection

  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    const user = socket.data.user;

    console.log(
      `User connected: ${user.email}`
    );

    // Track user connection

    const currentConnections =
      onlineUsers.get(user.id) ?? 0;

    onlineUsers.set(
      user.id,
      currentConnections + 1
    );

    // Personal user room

    socket.join(`user-${user.id}`);

    // Admin global activity room

    if (user.role === "ADMIN") {
      socket.join("admin-feed");

      console.log(
        `${user.email} joined admin-feed`
      );
    }

    // Notify admins about online users

    io.to("admin-feed").emit(
      "online-users-updated",
      {
        count: onlineUsers.size,
      }
    );

    // Get missed activities from database

    socket.on(
      "get-missed-activities",
      async (projectId?: unknown) => {
        try {
          let parsedProjectId:
            | number
            | undefined;

          if (projectId !== undefined) {
            if (
              typeof projectId !== "number" ||
              !Number.isInteger(projectId) ||
              projectId <= 0
            ) {
              socket.emit(
                "activity-error",
                {
                  code: "INVALID_PROJECT_ID",
                  message:
                    "Invalid project ID",
                }
              );

              return;
            }

            parsedProjectId = projectId;
          }

          const activities =
            await getActivities(
              user.id,
              user.role,
              parsedProjectId
            );

          socket.emit(
            "missed-activities",
            {
              activities,
            }
          );
        } catch (error) {
          console.error(
            "Missed activities error:",
            error
          );

          socket.emit(
            "activity-error",
            {
              code: "ACTIVITY_FETCH_ERROR",
              message:
                "Unable to fetch missed activities",
            }
          );
        }
      }
    );

    // Join project

    socket.on(
      "join-project",
      async (projectId: unknown) => {
        try {
          if (
            typeof projectId !== "number" ||
            !Number.isInteger(projectId) ||
            projectId <= 0
          ) {
            socket.emit("project-error", {
              code: "INVALID_PROJECT_ID",
              message: "Invalid project ID",
            });

            return;
          }

          const project =
            await prisma.project.findUnique({
              where: {
                id: projectId,
              },
              select: {
                id: true,
                createdById: true,
              },
            });

          if (!project) {
            socket.emit("project-error", {
              code: "PROJECT_NOT_FOUND",
              message: "Project not found",
            });

            return;
          }

          // Admin can access every project

          if (user.role === "ADMIN") {
            socket.join(
              `project-${projectId}`
            );

            console.log(
              `${user.email} joined project-${projectId}`
            );

            return;
          }

          // Project Manager can access only their projects

          if (
            user.role === "PROJECT_MANAGER"
          ) {
            if (
              project.createdById !== user.id
            ) {
              socket.emit("project-error", {
                code: "FORBIDDEN",
                message:
                  "You do not have access to this project",
              });

              return;
            }

            socket.join(
              `project-${projectId}`
            );

            console.log(
              `${user.email} joined project-${projectId}`
            );

            return;
          }

          // Developer can receive activity only
          // for tasks assigned to them

          if (user.role === "DEVELOPER") {
            const assignedTask =
              await prisma.task.findFirst({
                where: {
                  projectId,
                  assignedToId: user.id,
                },
                select: {
                  id: true,
                },
              });

            if (!assignedTask) {
              socket.emit("project-error", {
                code: "FORBIDDEN",
                message:
                  "You do not have an assigned task in this project",
              });

              return;
            }

            // Developer does not join project room.
            // Developer receives assigned task events
            // through their personal room.

            console.log(
              `${user.email} has access to assigned tasks in project-${projectId}`
            );

            return;
          }

          socket.emit("project-error", {
            code: "FORBIDDEN",
            message:
              "You do not have permission to access this project",
          });
        } catch (error) {
          console.error(
            "Project room error:",
            error
          );

          socket.emit("project-error", {
            code: "PROJECT_ACCESS_ERROR",
            message:
              "Unable to join project",
          });
        }
      }
    );

    // Leave project

    socket.on(
      "leave-project",
      (projectId: unknown) => {
        if (
          typeof projectId !== "number" ||
          !Number.isInteger(projectId) ||
          projectId <= 0
        ) {
          return;
        }

        const room =
          `project-${projectId}`;

        socket.leave(room);

        console.log(
          `${user.email} left ${room}`
        );
      }
    );

    // Disconnect

    socket.on("disconnect", () => {
      const connections =
        onlineUsers.get(user.id) ?? 0;

      if (connections <= 1) {
        onlineUsers.delete(user.id);
      } else {
        onlineUsers.set(
          user.id,
          connections - 1
        );
      }

      console.log(
        `User disconnected: ${user.email}`
      );

      // Notify admins about online users

      io.to("admin-feed").emit(
        "online-users-updated",
        {
          count: onlineUsers.size,
        }
      );
    });
  });

  return io;
};