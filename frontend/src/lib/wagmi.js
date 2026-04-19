import { http, createConfig } from "wagmi";
import { mainnet, sepolia, polygonAmoy, hardhat } from "wagmi/chains";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { metaMaskWallet, injectedWallet, rainbowWallet, coinbaseWallet, walletConnectWallet, } from "@rainbow-me/rainbowkit/wallets";
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID?.trim() || "";
// Build connectors. WalletConnect-based wallets are only added when we have a
// real projectId; otherwise RainbowKit would throw on init and blank the page.
const baseWallets = [metaMaskWallet, injectedWallet, coinbaseWallet];
const wcWallets = projectId ? [rainbowWallet, walletConnectWallet] : [];
const connectors = connectorsForWallets([
    {
        groupName: "Recommended",
        wallets: [...baseWallets, ...wcWallets],
    },
], {
    appName: "Crypto World Bank",
    projectId: projectId || "00000000000000000000000000000000",
});
export const wagmiConfig = createConfig({
    connectors,
    chains: [sepolia, polygonAmoy, mainnet, hardhat],
    ssr: false,
    transports: {
        [sepolia.id]: http(),
        [polygonAmoy.id]: http(),
        [mainnet.id]: http(),
        [hardhat.id]: http("http://127.0.0.1:8545"),
    },
});
