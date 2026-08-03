-- Phase 2 / 2B: economy simulation config + run history (Neon-persisted for Vercel)

CREATE TABLE "SimulationConfig" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "baseRateBps" INTEGER NOT NULL DEFAULT 300,
    "slope1Bps" INTEGER NOT NULL DEFAULT 500,
    "slope2Bps" INTEGER NOT NULL DEFAULT 7500,
    "kinkBps" INTEGER NOT NULL DEFAULT 8000,
    "minReserveRatio" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "tierModifiersJson" JSONB,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SimulationConfig_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SimulationConfigHistory" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL DEFAULT 'default',
    "field" TEXT NOT NULL,
    "fromValue" JSONB NOT NULL,
    "toValue" JSONB NOT NULL,
    "changedBy" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SimulationConfigHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SimulationConfigHistory_configId_createdAt_idx" ON "SimulationConfigHistory"("configId", "createdAt");

CREATE TABLE "SimulationRun" (
    "id" TEXT NOT NULL,
    "seed" INTEGER NOT NULL,
    "totalCapitalUsdc" DOUBLE PRECISION NOT NULL,
    "clientMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "simulatedDays" INTEGER NOT NULL DEFAULT 365,
    "sampleNationals" INTEGER NOT NULL,
    "sampleLocalsPerNational" INTEGER NOT NULL,
    "clientsPerLocal" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "summaryJson" JSONB,
    "verificationJson" JSONB,
    "configSnapshotJson" JSONB,
    "triggeredBy" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "SimulationRun_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SimulationRun_startedAt_idx" ON "SimulationRun"("startedAt");

INSERT INTO "SimulationConfig" ("id", "baseRateBps", "slope1Bps", "slope2Bps", "kinkBps", "minReserveRatio", "tierModifiersJson", "updatedAt")
VALUES (
    'default',
    300,
    500,
    7500,
    8000,
    0.15,
    '{"BRONZE":0,"SILVER":-25,"GOLD":-50,"PLATINUM":-100,"DIAMOND":-200}'::jsonb,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;
