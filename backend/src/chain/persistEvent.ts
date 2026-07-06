import type { Prisma } from "@prisma/client";
import { getPrisma } from "../db/prisma";

export async function persistBlockchainEvent(input: {
  contract: string;
  eventName: string;
  txHash: string;
  blockNumber: number;
  logIndex: number;
  payload: Prisma.InputJsonValue;
}): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;

  try {
    await prisma.blockchainEventLog.upsert({
      where: {
        txHash_logIndex: {
          txHash: input.txHash,
          logIndex: input.logIndex,
        },
      },
      update: {},
      create: input,
    });
  } catch {
    // Indexer must not crash the API when Postgres is unavailable.
  }
}
