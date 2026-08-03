import type { PrismaClient } from "@prisma/client";

/** Upsert InstitutionCapital by institutionId (works even if DB unique index is missing). */
export async function upsertInstitutionCapital(
  prisma: PrismaClient,
  institutionId: string,
  data: {
    reserveEth: number;
    allocatedEth: number;
    lentEth: number;
    repaidEth: number;
    activeLoanCount?: number;
  },
): Promise<void> {
  const existing = await prisma.institutionCapital.findFirst({
    where: { institutionId },
  });
  if (existing) {
    await prisma.institutionCapital.update({
      where: { id: existing.id },
      data: { ...data, syncedAt: new Date() },
    });
    return;
  }
  await prisma.institutionCapital.create({
    data: {
      institutionId,
      reserveEth: data.reserveEth,
      allocatedEth: data.allocatedEth,
      lentEth: data.lentEth,
      repaidEth: data.repaidEth,
      activeLoanCount: data.activeLoanCount ?? 0,
      syncedAt: new Date(),
    },
  });
}

export async function adjustInstitutionCapital(
  prisma: PrismaClient,
  institutionId: string,
  delta: {
    reserveEth?: number;
    allocatedEth?: number;
    lentEth?: number;
    repaidEth?: number;
  },
): Promise<void> {
  const row = await prisma.institutionCapital.findFirst({ where: { institutionId } });
  if (!row) return;
  await prisma.institutionCapital.update({
    where: { id: row.id },
    data: {
      reserveEth: delta.reserveEth != null ? row.reserveEth + delta.reserveEth : undefined,
      allocatedEth: delta.allocatedEth != null ? row.allocatedEth + delta.allocatedEth : undefined,
      lentEth: delta.lentEth != null ? row.lentEth + delta.lentEth : undefined,
      repaidEth: delta.repaidEth != null ? row.repaidEth + delta.repaidEth : undefined,
      syncedAt: new Date(),
    },
  });
}
