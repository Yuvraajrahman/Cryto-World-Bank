/**
 * @deprecated Prefer `../db/facilitiesOpsPg` (Postgres).
 * Kept for `interbankAprBps` re-export compatibility.
 */
export {
  interbankAprBps,
  type InterbankTenorDays,
  type InterbankLoan,
  type UpwardDeposit,
} from "../db/facilitiesOpsPg";

/** No-op stub — tests should call `resetFacilitiesPg` instead. */
export const facilitiesOpsDb = {
  state: { interbankLoans: [] as unknown[], upwardDeposits: [] as unknown[] },
  save() {},
  reload() {},
  reset() {},
  uid: (p: string) => p,
  nowIso: () => new Date().toISOString(),
};
