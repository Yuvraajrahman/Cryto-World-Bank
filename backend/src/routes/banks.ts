import { Router } from "express";

export const banksRouter = Router();

// Placeholder: real impl reads Bank entities from Prisma + contract state.
banksRouter.get("/", (_req, res) => {
  res.json({
    worldBank: {
      name: "Crypto World Bank Reserve",
      aprBps: 300,
      totalReserve: "0",
      totalAllocated: "0",
    },
    nationalBanks: [],
    localBanks: [],
  });
});

banksRouter.get("/stats", (_req, res) => {
  res.json({
    totalDeposits: "0",
    totalAllocated: "0",
    totalRepaid: "0",
    activeLoans: 0,
    borrowerCount: 0,
  });
});
