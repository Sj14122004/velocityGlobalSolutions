import type { RequestHandler } from "express";

export const wrapAsync = (handler: RequestHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next))
    .catch(next);
  };
};