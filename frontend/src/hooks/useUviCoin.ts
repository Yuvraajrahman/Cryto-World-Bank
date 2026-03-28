import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseAbi } from "viem";
import { UVICOIN_ADDRESS } from "../config/contracts";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as `0x${string}`;
const isUviCoinDeployed = UVICOIN_ADDRESS !== ZERO_ADDRESS;

const UVI_ABI = parseAbi([
  "function balanceOf(address account) view returns (uint256)",
  "function faucet()",
  "function hasClaimedFaucet(address) view returns (bool)",
  "function symbol() view returns (string)",
] as const);

export function useUviCoinBalance(address: `0x${string}` | undefined) {
  return useReadContract({
    address: isUviCoinDeployed ? UVICOIN_ADDRESS : undefined,
    abi: UVI_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });
}

export function useUviCoinFaucet() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const claimFaucet = () => {
    if (!isUviCoinDeployed) return;
    writeContract({
      address: UVICOIN_ADDRESS,
      abi: UVI_ABI,
      functionName: "faucet",
    });
  };

  return { claimFaucet, isPending: isPending || isConfirming, isSuccess, isDeployed: isUviCoinDeployed };
}

export function useHasClaimedFaucet(address: `0x${string}` | undefined) {
  return useReadContract({
    address: isUviCoinDeployed ? UVICOIN_ADDRESS : undefined,
    abi: UVI_ABI,
    functionName: "hasClaimedFaucet",
    args: address ? [address] : undefined,
  });
}

export { isUviCoinDeployed };
