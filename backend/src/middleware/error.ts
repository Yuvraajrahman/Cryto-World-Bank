import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({ error: "validation_error", details: err.errors });
    return;
  }
  console.error(err);
  res.status(err.status ?? 500).json({
    error: err.code ?? "internal_error",
    message: err.message ?? "Something went wrong",
  });
};
