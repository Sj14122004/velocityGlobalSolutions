import cors from "cors";

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
];

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests without an origin
    // (Postman, server-to-server requests, etc.)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
});