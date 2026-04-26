import { http, createConfig } from "wagmi";
import { mainnet, sepolia, polygonAmoy, hardhat } from "wagmi/chains";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  injectedWallet,
  rainbowWallet,
  coinbaseWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";

const projectId =
  (import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined)?.trim() || "";

// Build connectors. WalletConnect-based wallets are only added when we have a
// real projectId; otherwise RainbowKit would throw on init and blank the page.
const baseWallets = [metaMaskWallet, injectedWallet, coinbaseWallet];
const wcWallets = projectId ? [rainbowWallet, walletConnectWallet] : [];

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [...baseWallets, ...wcWallets],
    },
  ],
  {
    appName: "Crypto World Bank",
    projectId: projectId || "00000000000000000000000000000000",
  },
);

// NOTE: Wagmi/Viem `http()` without a URL may pick a provider that does not
// allow browser CORS (you may see errors to `eth.merkle.io`). For local dev,
// pin public RPC endpoints (and allow overrides via env).
const sepoliaRpc =
  (import.meta.env.VITE_SEPOLIA_RPC_URL as string | undefined)?.trim() ||
  "https://rpc.sepolia.org";
const polygonAmoyRpc =
  (import.meta.env.VITE_POLYGON_AMOY_RPC_URL as string | undefined)?.trim() ||
  "https://rpc-amoy.polygon.technology";
const mainnetRpc =
  (import.meta.env.VITE_MAINNET_RPC_URL as string | undefined)?.trim() ||
  "https://cloudflare-eth.com";

export const wagmiConfig = createConfig({
  connectors,
  chains: [sepolia, polygonAmoy, mainnet, hardhat],
  ssr: false,
  transports: {
    [sepolia.id]: http(sepoliaRpc),
    [polygonAmoy.id]: http(polygonAmoyRpc),
    [mainnet.id]: http(mainnetRpc),
    [hardhat.id]: http("http://127.0.0.1:8545"),
  },
});
