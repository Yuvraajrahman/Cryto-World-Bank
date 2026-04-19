import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { pino } from "pino";
import { config } from "./config";
import { authRouter } from "./routes/auth";
import { banksRouter } from "./routes/banks";
import { loansRouter } from "./routes/loans";
import { marketRouter } from "./routes/market";
import { profileRouter } from "./routes/profile";
import { chatRouter } from "./routes/chat";
import { riskRouter } from "./routes/risk";
import { errorHandler } from "./middleware/error";

const logger = pino({
  transport: { target: "pino-pretty", options: { colorize: true } },
});

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin.split(","),
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(
  rateLimit({
    windowMs: 60_000,
    limit: 300,
    standardHeaders: true,
  }),
);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "crypto-world-bank-api", time: new Date().toISOString() });
});

app.use("/api/auth", authRouter);
app.use("/api/banks", banksRouter);
app.use("/api/loans", loansRouter);
app.use("/api/market", marketRouter);
app.use("/api/profile", profileRouter);
app.use("/api/chat", chatRouter);
app.use("/api/risk", riskRouter);

app.use(errorHandler);

app.listen(config.port, () => {
  logger.info(`Crypto World Bank API listening on :${config.port}`);
});
