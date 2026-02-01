import { getContract } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { CONTRACT_ADDRESS } from "../config/contracts";
import { WorldBankReserveABI } from "../contracts/WorldBankReserveABI";

export function useWorldBankContract() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const contract = getContract({
    address: CONTRACT_ADDRESS,
    abi: WorldBankReserveABI,
    client: {
      public: publicClient ?? undefined,
      wallet: walletClient ?? undefined,
    },
  });

  return contract;
}
