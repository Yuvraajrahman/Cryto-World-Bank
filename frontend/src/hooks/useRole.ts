import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useWorldBankContract } from "./useContract";
import { useDemoMode } from "../context/DemoModeContext";

export type Role = "user" | "bank";

/**
 * Returns the current user's role.
 * - bank: contract owner (manages 1M ETH reserve, sees risk, approves loans)
 * - user: everyone else (deposits, requests loans; no risk/security UI)
 * When demoRole is set (Demo Admin / Demo User), that overrides the real contract check.
 */
export function useRole(): { role: Role; isBankOrAdmin: boolean; loading: boolean } {
  const { demoRole } = useDemoMode();
  const { address, isConnected } = useAccount();
  const contract = useWorldBankContract();
  const [realIsBank, setRealIsBank] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (demoRole !== null) {
      setLoading(false);
      return;
    }
    if (!isConnected || !address) {
      setRealIsBank(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    contract.read
      .owner()
      .then((owner: string) => {
        if (!cancelled) {
          setRealIsBank(owner.toLowerCase() === address.toLowerCase());
        }
      })
      .catch(() => {
        if (!cancelled) setRealIsBank(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [address, isConnected, contract, demoRole]);

  const isBankOrAdmin = demoRole === "bank" ? true : demoRole === "user" ? false : realIsBank;
  const role: Role = isBankOrAdmin ? "bank" : "user";
  return { role, isBankOrAdmin, loading };
}
