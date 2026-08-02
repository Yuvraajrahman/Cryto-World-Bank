import "dotenv/config";
import { pino } from "pino";
import { config } from "./config";
import { createApp } from "./app";
import { startIndexer } from "./chain/indexer";
import { startOverdueJob } from "./jobs/overdue";
import { requirePrisma } from "./db/prisma";

const logger = pino({
  transport: { target: "pino-pretty", options: { colorize: true } },
});

async function main() {
  try {
    const prisma = requirePrisma();
    await prisma.$queryRaw`SELECT 1`;
    logger.info("PostgreSQL connected");
  } catch (err) {
    logger.error(
      { err },
      "PostgreSQL unavailable — start with `docker compose up -d` then `cd backend && npx prisma migrate deploy && npx prisma db seed`",
    );
    process.exit(1);
  }

  const app = createApp();
  app.listen(config.port, () => {
    logger.info(`Crypto World Bank API listening on :${config.port}`);
    startIndexer(logger).catch((e) => {
      logger.warn({ err: e }, "indexer failed to start");
    });
    const stopOverdue = startOverdueJob(logger);
    process.on("SIGTERM", () => stopOverdue());
    process.on("SIGINT", () => stopOverdue());
  });
}

main();
