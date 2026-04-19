import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config";
import { authRouter } from "./routes/auth";
import { banksRouter } from "./routes/banks";
import { loansRouter } from "./routes/loans";
import { marketRouter } from "./routes/market";
import { profileRouter } from "./routes/profile";
import { chatRouter } from "./routes/chat";
import { chatbotRouter } from "./routes/chatbot";
import { incomeRouter } from "./routes/income";
import { riskRouter } from "./routes/risk";
import { errorHandler } from "./middleware/error";

// Builds the Express app without binding a port. index.ts wraps it in
// app.listen() for production; the integration test suite imports this
// factory so it can call supertest(app) directly.
export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigin.split(","),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "12mb" }));

  // Rate limiting is helpful in production but harmful in the test suite,
  // where a single file fires dozens of requests in a few hundred ms. Skip it
  // during NODE_ENV=test.
  if (process.env.NODE_ENV !== "test") {
    app.use(
      rateLimit({
        windowMs: 60_000,
        limit: 300,
        standardHeaders: true,
      }),
    );
  }

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "crypto-world-bank-api",
      time: new Date().toISOString(),
    });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/banks", banksRouter);
  app.use("/api/loans", loansRouter);
  app.use("/api/market", marketRouter);
  app.use("/api/profile", profileRouter);
  app.use("/api/chat", chatRouter);
  app.use("/api/chatbot", chatbotRouter);
  app.use("/api/income", incomeRouter);
  app.use("/api/risk", riskRouter);

  app.use(errorHandler);

  return app;
}
