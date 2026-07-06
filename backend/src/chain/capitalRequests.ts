import { ethers } from "ethers";
import { config } from "../config";
import { WORLD_EVENTS_ABI, NATIONAL_EVENTS_ABI } from "./abis";
import { getChainProvider } from "./provider";

export interface CapitalRequestRow {
  requestId: string;
  bank: string;
  amountWei: string;
  amountEth: string;
  open: boolean;
  tier: "world" | "national";
}

export async function fetchCapitalRequests(
  tier: "world" | "national",
): Promise<CapitalRequestRow[]> {
  const provider = getChainProvider();
  if (!provider) return [];

  const addr =
    tier === "world" ? config.contracts.worldBank : config.contracts.nationalBank;
  if (!addr) return [];

  const abi = tier === "world" ? WORLD_EVENTS_ABI : NATIONAL_EVENTS_ABI;
  const c = new ethers.Contract(addr, abi, provider);
  const nextId: bigint = await c.nextCapitalRequestId();
  const rows: CapitalRequestRow[] = [];

  for (let id = 1n; id < nextId; id++) {
    const r = await c.capitalRequests(id);
    const bank = (r.bank ?? r[0]) as string;
    const amount = (r.amount ?? r[1]) as bigint;
    const open = Boolean(r.open ?? r[2]);
    rows.push({
      requestId: id.toString(),
      bank,
      amountWei: amount.toString(),
      amountEth: ethers.formatEther(amount),
      open,
      tier,
    });
  }

  return rows.filter((r) => r.open);
}
