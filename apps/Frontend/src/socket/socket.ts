import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
});

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error(
    "Socket connection error:",
    error.message
  );
});

socket.on("notification-created", (notification) => {
  console.log(
    "New notification:",
    notification
  );
});

socket.on("notification-count-updated", (data) => {
  console.log(
    "Unread notification count:",
    data.count
  );
});

socket.on("task-status-updated", (data) => {
  console.log(
    "Task status updated:",
    data
  );
});