import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { polygonMumbai, sepolia } from "wagmi/chains";

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "YOUR_WALLETCONNECT_PROJECT_ID";

export const config = getDefaultConfig({
  appName: "Decentralized Crypto Reserve & Lending Bank",
  projectId: projectId,
  chains: [polygonMumbai, sepolia],
  ssr: false,
});
