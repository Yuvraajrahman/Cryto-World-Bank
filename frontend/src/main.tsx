import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { wagmiConfig } from "@/lib/wagmi";
import { App } from "@/App";

import "@rainbow-me/rainbowkit/styles.css";
import "@/styles/globals.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
});

const rainbowTheme = darkTheme({
  accentColor: "#d4af37",
  accentColorForeground: "#0a0a0b",
  borderRadius: "large",
  fontStack: "system",
  overlayBlur: "small",
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rainbowTheme} modalSize="compact" coolMode>
          <BrowserRouter>
            <App />
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "#101013",
                  color: "#f3f3f3",
                  border: "1px solid rgba(212,175,55,0.35)",
                  boxShadow: "0 10px 40px -10px rgba(0,0,0,0.7)",
                },
              }}
            />
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);
