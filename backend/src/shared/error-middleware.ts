import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { logger } from "../observability/logger.js";
import { HttpError } from "./http-error.js";

export function errorMiddleware(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  void _next;

  if (error instanceof HttpError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      details: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
      }))
    });
    return;
  }

  logger.error(
    {
      err: error,
      method: req.method,
      path: req.originalUrl
    },
    "Unhandled API error"
  );
  res.status(500).json({ error: "Internal server error" });
}
