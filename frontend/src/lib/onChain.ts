import { contractAddresses } from "./contracts";

export function contractsConfigured(): boolean {
  return Boolean(
    contractAddresses.worldBank &&
      contractAddresses.nationalBank &&
      contractAddresses.localBank,
  );
}

export const LOAN_STATUS: Record<number, string> = {
  0: "PENDING",
  1: "APPROVED",
  2: "REJECTED",
  3: "ACTIVE",
  4: "REPAID",
  5: "DEFAULTED",
};
