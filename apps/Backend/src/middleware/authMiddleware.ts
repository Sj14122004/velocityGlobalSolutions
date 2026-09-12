import type { RequestHandler } from "express";
import passport from "../config/passport.js";

export const authenticate: RequestHandler = (req, res, next) => {
  passport.authenticate(
    "jwt",
    { session: false },
    (error: unknown, user: Express.User | false) => {
      if (error) {
        return next(error);
      }

      if (!user) {
        res.status(401).json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        });
        return;
      }

      req.user = user;
      next();
    }
  )(req, res, next);
};