import "dotenv/config";
import { pino } from "pino";
import { config } from "./config";
import { createApp } from "./app";
import { startIndexer } from "./chain/indexer";

const logger = pino({
  transport: { target: "pino-pretty", options: { colorize: true } },
});

const app = createApp();

app.listen(config.port, () => {
  logger.info(`Crypto World Bank API listening on :${config.port}`);
  // Fire-and-forget: indexer never blocks API startup. When CHAIN_RPC_URL or
  // contract addresses are missing it logs a warning and returns.
  startIndexer(logger).catch((err) => {
    logger.warn({ err }, "indexer failed to start");
  });
});
