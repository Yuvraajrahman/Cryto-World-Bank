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
import { aiRouter } from "./routes/ai";
import { phase1Router } from "./routes/phase1";
import { phase2Router } from "./routes/phase2";
import { chainRouter } from "./routes/chain";
import { briefRouter } from "./routes/brief";
import { oracleRouter } from "./routes/oracle";
import { agentRouter } from "./routes/agent";
import { publicRouter } from "./routes/public";
import { onboardingRouter } from "./routes/onboarding";
import { notificationsRouter } from "./routes/notifications";
import { groupsRouter } from "./routes/groups";
import { depositsRouter } from "./routes/deposits";
import { passportRouter } from "./routes/passport";
import { localBankRouter } from "./routes/localBank";
import { nationalBankRouter } from "./routes/nationalBank";
import { worldBankRouter } from "./routes/worldBank";
import { treasuryRouter } from "./routes/treasury";
import { facilitiesRouter } from "./routes/facilities";
import { auditRouter } from "./routes/audit";
import { devAdminRouter } from "./routes/devAdmin";
import { errorHandler } from "./middleware/error";

// Builds the Express app without binding a port. index.ts wraps it in
// app.listen() for production; the integration test suite imports this
// factory so it can call supertest(app) directly.
export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        // No Origin header: server-to-server / curl / some tooling
        if (!origin) {
          callback(null, true);
          return;
        }

        if (process.env.NODE_ENV === "production") {
          const allowed = config.corsOrigin.split(",").map((s) => s.trim());
          if (allowed.includes(origin)) {
            callback(null, true);
            return;
          }
          // Allow Vercel production + preview deployments
          try {
            const u = new URL(origin);
            if (u.hostname.endsWith(".vercel.app")) {
              callback(null, true);
              return;
            }
          } catch {
            /* fall through */
          }
          callback(new Error("Not allowed by CORS"));
          return;
        }

        // Dev: localhost + Vercel (hybrid demo: Vercel UI → ngrok → local API)
        try {
          const u = new URL(origin);
          if (u.hostname === "localhost" || u.hostname === "127.0.0.1") {
            callback(null, true);
            return;
          }
          if (u.hostname.endsWith(".vercel.app")) {
            callback(null, true);
            return;
          }
        } catch {
          /* fall through */
        }
        const allowed = config.corsOrigin.split(",").map((s) => s.trim());
        callback(null, allowed.includes(origin));
      },
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
  app.use("/api/public", publicRouter);
  app.use("/api/onboarding", onboardingRouter);
  app.use("/api/notifications", notificationsRouter);
  app.use("/api/groups", groupsRouter);
  app.use("/api/deposits", depositsRouter);
  app.use("/api/passport", passportRouter);
  app.use("/api/local-bank", localBankRouter);
  app.use("/api/national-bank", nationalBankRouter);
  app.use("/api/world-bank", worldBankRouter);
  app.use("/api/treasury", treasuryRouter);
  app.use("/api/facilities", facilitiesRouter);
  app.use("/api/audit", auditRouter);
  app.use("/api/dev-admin", devAdminRouter);
  app.use("/api/banks", banksRouter);
  app.use("/api/loans", loansRouter);
  app.use("/api/market", marketRouter);
  app.use("/api/profile", profileRouter);
  app.use("/api/chat", chatRouter);
  app.use("/api/chatbot", chatbotRouter);
  app.use("/api/ai", aiRouter);
  app.use("/api/income", incomeRouter);
  app.use("/api/risk", riskRouter);
  app.use("/api/phase1", phase1Router);
  app.use("/api/phase2", phase2Router);
  app.use("/api/chain", chainRouter);
  app.use("/api/brief", briefRouter);
  app.use("/api/oracle", oracleRouter);
  app.use("/api/agent", agentRouter);

  app.use(errorHandler);

  return app;
}
