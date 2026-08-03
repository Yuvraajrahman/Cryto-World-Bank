import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createApp } from "../src/app";
import { bootstrapApi } from "../src/bootstrap";

const app = createApp();
let ready: Promise<void> | null = null;

function ensureReady(): Promise<void> {
  if (!ready) {
    ready = bootstrapApi().catch((err) => {
      ready = null;
      throw err;
    });
  }
  return ready;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await ensureReady();
    return app(req, res);
  } catch (err) {
    console.error("API bootstrap failed:", err);
    res.status(503).json({
      error: "service_unavailable",
      message: "Database unavailable. Set DATABASE_URL on the API project.",
    });
  }
}
