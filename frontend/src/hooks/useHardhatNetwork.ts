import { useCallback } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { hardhat } from "wagmi/chains";
import toast from "react-hot-toast";
import { HARDHAT_CHAIN_ID } from "@shared/hardhat-accounts";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

export function isLocalHardhatEnv(): boolean {
  return String(import.meta.env.VITE_CHAIN_ID ?? "") === String(HARDHAT_CHAIN_ID);
}

export async function addHardhatNetwork(provider: EthereumProvider): Promise<void> {
  await provider.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: "0x7a69",
        chainName: "Hardhat Local",
        nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
        rpcUrls: ["http://127.0.0.1:8545"],
      },
    ],
  });
}

export function useHardhatNetwork() {
  const { chain, isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const onHardhat = chain?.id === HARDHAT_CHAIN_ID;

  const setupHardhat = useCallback(async () => {
    const provider = (window as Window & { ethereum?: EthereumProvider }).ethereum;
    if (!provider?.request) {
      toast.error("MetaMask not detected");
      return;
    }
    try {
      await addHardhatNetwork(provider);
    } catch {
      /* network may already exist */
    }
    try {
      await switchChainAsync({ chainId: hardhat.id });
      toast.success("Connected to Hardhat Local (31337)");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message.slice(0, 120) : "Switch network in MetaMask");
    }
  }, [switchChainAsync]);

  return { onHardhat, setupHardhat, isConnected, isLocalDev: isLocalHardhatEnv() };
}
